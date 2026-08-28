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
