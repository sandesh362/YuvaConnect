import { GigStatus, PaymentStatus, Prisma, Role } from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { razorpay } from "../config/razorpay";

const idParam = (value: string | string[]) => Array.isArray(value) ? value[0] : value;

async function isBusiness(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === Role.BUSINESS;
}

async function ownedGig(id: string, businessId: string) {
  return prisma.gig.findFirst({ where: { id, businessId } });
}

function amountInPaise(amount: Prisma.Decimal) {
  const paise = new Prisma.Decimal(amount).mul(100);
  if (!paise.isInteger() || paise.lte(0)) throw new Error("Gig budget must be greater than zero");
  return paise.toNumber();
}

export async function createOrder(req: Request, res: Response) {
  try {
    if (!await isBusiness(req.userId!)) return res.status(403).json({ message: "Business access required" });
    const gig = await ownedGig(idParam(req.params.id), req.userId!);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.status !== GigStatus.ASSIGNED) return res.status(409).json({ message: "Only assigned gigs can be funded" });

    const existing = await prisma.payment.findUnique({ where: { gigId: gig.id } });
    if (existing) {
      if (existing.status !== PaymentStatus.PENDING) return res.status(409).json({ message: "This gig has already been funded" });
      return res.json({ order: { id: existing.razorpayOrderId, amount: amountInPaise(existing.amount), currency: "INR", keyId: env.razorpayKeyId }, payment: existing });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise(gig.budget),
      currency: "INR",
      receipt: `gig_${gig.id.slice(-24)}`,
      notes: { gigId: gig.id },
    });
    const payment = await prisma.payment.create({ data: { gigId: gig.id, razorpayOrderId: order.id, amount: gig.budget } });
    return res.status(201).json({ order: { ...order, keyId: env.razorpayKeyId }, payment });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Could not create payment order" });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    if (!await isBusiness(req.userId!)) return res.status(403).json({ message: "Business access required" });
    const gig = await ownedGig(idParam(req.params.id), req.userId!);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    const body = req.body as Record<string, unknown>;
    const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
    const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
    if (!orderId || !paymentId || !signature) return res.status(400).json({ message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required" });
    const payment = await prisma.payment.findUnique({ where: { gigId: gig.id } });
    if (!payment) return res.status(409).json({ message: "Create a payment order before verifying payment" });
    if (payment.status === PaymentStatus.HELD && payment.razorpayPaymentId === paymentId) return res.json({ payment });
    if (payment.status !== PaymentStatus.PENDING) return res.status(409).json({ message: "This payment cannot be verified" });
    if (payment.razorpayOrderId !== orderId) return res.status(400).json({ message: "Payment order does not match this gig" });

    const expected = createHmac("sha256", env.razorpayKeySecret).update(`${payment.razorpayOrderId}|${paymentId}`).digest("hex");
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return res.status(400).json({ message: "Invalid Razorpay payment signature" });

    // Production escrow/split release needs Razorpay Route and separate account setup; pilot mode only records a captured payment as held.
    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { razorpayPaymentId: paymentId, status: PaymentStatus.HELD } });
    return res.json({ payment: updated });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Could not verify payment" });
  }
}

export async function releasePayment(req: Request, res: Response) {
  if (!await isBusiness(req.userId!)) return res.status(403).json({ message: "Business access required" });
  const gig = await ownedGig(idParam(req.params.id), req.userId!);
  if (!gig) return res.status(404).json({ message: "Gig not found" });
  if (gig.status !== GigStatus.SUBMITTED) return res.status(409).json({ message: "Only submitted gigs can be approved and paid" });
  const payment = await prisma.payment.findUnique({ where: { gigId: gig.id } });
  if (!payment || payment.status !== PaymentStatus.HELD) return res.status(409).json({ message: "A verified held payment is required before release" });

  // TODO: In production, call Razorpay Route transfer/payout APIs after verified business KYC before marking this released.
  const [updatedPayment, updatedGig] = await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.RELEASED } }),
    prisma.gig.update({ where: { id: gig.id }, data: { status: GigStatus.PAID } }),
  ]);
  return res.json({ payment: updatedPayment, gig: updatedGig });
}

export async function getEarnings(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { role: true } });
  if (user?.role !== Role.STUDENT) return res.status(403).json({ message: "Student access required" });
  const payments = await prisma.payment.findMany({
    where: { status: PaymentStatus.RELEASED, gig: { applications: { some: { studentId: req.userId!, status: "SELECTED" } } } },
    select: { id: true, amount: true, updatedAt: true, gig: { select: { id: true, title: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const total = payments.reduce((sum, payment) => sum.plus(payment.amount), new Prisma.Decimal(0));
  return res.json({ payments: payments.map((payment) => ({ id: payment.id, gigId: payment.gig.id, gigTitle: payment.gig.title, amount: payment.amount, date: payment.updatedAt })), total });
}
