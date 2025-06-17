export type UserRole = "Agent" | "Buyer" | "Admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface PDFTemplate {
  id: number;
  title: string;
  owner_id: number;
  anvil_template_eid: string;
}

export interface Submission {
  id: number;
  buyer_id: number;
  filled_pdf_url?: string;
}

export interface AdminDashboardData extends PDFTemplate {
  owner: User;
  latest_submission: Submission | null;
}

export interface AnvilField {
    id: string;
    type: string;
    title: string;
}