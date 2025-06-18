export type UserRole = 'Agent' | 'Buyer' | 'Admin';

export interface User {
  id: string | number;
  email: string;
  role: UserRole;
}

export interface PDFTemplate {
  anvil_template_eid: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AnvilField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
}

export interface Submission {
  id: string;
  template_id: string;
  template_title: string;
  status: 'pending' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
  pdf_url?: string;
} 