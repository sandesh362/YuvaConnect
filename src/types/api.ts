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
};

export type GigStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID' | 'CLOSED';
export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
export type Gig = { id: string; businessId: string; title: string; description: string; skillsRequired: string[]; budget: string; deadline: string; location: string; status: GigStatus; createdAt: string; updatedAt: string; business?: { id: string; name: string; businessProfile?: { businessName: string } | null }; applications?: { id: string; studentId: string; status: ApplicationStatus }[]; deliverables?: Deliverable[]; revisionRequests?: RevisionRequest[] };
export type Application = { id: string; gigId: string; studentId: string; proposal: string; relevantExperience: string; availability: string; status: ApplicationStatus; createdAt: string; gig?: Gig };
export type Deliverable = { id: string; gigId: string; fileUrl: string; note: string; submittedAt: string };
export type RevisionRequest = { id: string; gigId: string; feedback: string; requestedAt: string };
