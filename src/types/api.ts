export type Role = 'STUDENT' | 'BUSINESS' | 'ADMIN';
export type Availability = 'FULL_TIME_AVAILABLE' | 'PART_TIME' | 'WEEKENDS_ONLY';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
};

export type StudentProfile = {
  userId: string;
  college: string;
  skills: string[];
  bio: string;
  availability: Availability;
  profileImageUrl: string | null;
  isVerified: boolean;
  avgRating: number;
  totalRatings: number;
  portfolioItems: PortfolioItem[];
};

export type BusinessProfile = {
  userId: string;
  businessName: string;
  category: string;
  registrationNumber: string;
  address: string;
  shopImageUrl: string | null;
  isVerified: boolean;
  avgRating: number;
  totalRatings: number;
};

export type GigStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID' | 'CLOSED';
export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
export type Gig = { id: string; businessId: string; title: string; description: string; skillsRequired: string[]; budget: string; deadline: string; location: string; status: GigStatus; createdAt: string; updatedAt: string; business?: { id: string; name: string; businessProfile?: { businessName: string } | null }; applications?: { id: string; studentId: string; status: ApplicationStatus }[]; deliverables?: Deliverable[]; revisionRequests?: RevisionRequest[]; payment?: Payment | null };
export type Application = { id: string; gigId: string; studentId: string; proposal: string; relevantExperience: string; availability: string; status: ApplicationStatus; createdAt: string; gig?: Gig };
export type Deliverable = { id: string; gigId: string; fileUrl: string; note: string; submittedAt: string };
export type RevisionRequest = { id: string; gigId: string; feedback: string; requestedAt: string };
export type PaymentStatus = 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'FAILED';
export type Payment = { id: string; gigId: string; razorpayOrderId: string; razorpayPaymentId: string | null; amount: string; status: PaymentStatus; createdAt: string; updatedAt: string };

export type Message = { id: string; gigId: string; senderId: string; content: string; createdAt: string; sender?: { id: string; name: string } };
export type MessagesPage = { messages: Message[]; nextCursor: string | null };
export type Rating = { id: string; gigId: string; fromUserId: string; toUserId: string; score: number; comment: string | null; createdAt: string; fromUser?: { id: string; name: string }; gig?: { id: string; title: string } };
export type RatingSummary = { avgRating: number; totalRatings: number };
export type Report = { id: string; gigId: string | null; reporterId: string; reason: string; status: 'OPEN' | 'REVIEWING' | 'RESOLVED'; createdAt: string };
export type NotificationType = 'NEW_APPLICANT' | 'APPLICATION_SELECTED' | 'APPLICATION_REJECTED' | 'GIG_STATUS_CHANGED' | 'NEW_MESSAGE' | 'PAYMENT_RELEASED';
export type NotificationItem = { id: string; userId: string; type: NotificationType; message: string; relatedGigId: string | null; isRead: boolean; createdAt: string; relatedGig?: { id: string; title: string; status: GigStatus } | null };
export type NotificationsPage = { notifications: NotificationItem[]; unreadCount: number; page: number; limit: number; total: number };
