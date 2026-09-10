import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function testRazorpayKeyId(): string {
  const keyId = required("RAZORPAY_KEY_ID");
  if (!keyId.startsWith("rzp_test_")) throw new Error("RAZORPAY_KEY_ID must be a Razorpay test-mode key for this pilot");
  return keyId;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  razorpayKeyId: testRazorpayKeyId(),
  razorpayKeySecret: required("RAZORPAY_KEY_SECRET"),
  port: Number(process.env.PORT ?? 4000),
};
