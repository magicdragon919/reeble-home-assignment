export type UserRole = "Agent" | "Buyer" | "Admin";
export type FieldType = "shortText" | "fullName" | "singerName" | "usAddress" | "longText" | "date" | "email" | "phone" | "number" | "dollar" | "percent" | "charList" | "checkbox" | "radioGroup" | "textWrap" ;

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
    name: string;
    pageNum: number;
    type: FieldType;
}