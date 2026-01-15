import type {
  User,
  Recruit,
  Dispute,
  DisputeLog,
  Order,
} from "@prisma/client";

export type {
  User,
  Recruit,
  Dispute,
  DisputeLog,
  Order,
};

// Type aliases for string-based enums (SQLite compatible)
export type UserRole = "admin" | "agent";
export type RecruitStatus = "new_recruit" | "contacted" | "follow_up_needed" | "signed_up" | "not_interested" | "do_not_call";
export type DisputeReason = "wrong_info" | "unreachable" | "duplicate" | "invalid_recruit" | "other";
export type DisputeStatus = "pending_review" | "approved" | "denied";
export type ResolutionAction = "replace_recruit" | "credit_agent" | "mark_invalid";
export type OrderStatus = "pending" | "completed" | "refunded";

// Recruit with related data
export type RecruitWithDisputes = Recruit & {
  disputes: Dispute[];
};

// Dispute with related data
export type DisputeWithRelations = Dispute & {
  recruit: Recruit;
  agent: Pick<User, "id" | "email" | "firstName" | "lastName">;
  resolvedBy?: Pick<User, "id" | "email" | "firstName" | "lastName"> | null;
};

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Status display mapping
export const RECRUIT_STATUS_LABELS: Record<RecruitStatus, string> = {
  new_recruit: "New Recruit",
  contacted: "Contacted",
  follow_up_needed: "Follow Up Needed",
  signed_up: "Signed Up",
  not_interested: "Not Interested",
  do_not_call: "Do Not Call",
};

export const RECRUIT_STATUS_COLORS: Record<RecruitStatus, string> = {
  new_recruit: "blue",
  contacted: "yellow",
  follow_up_needed: "orange",
  signed_up: "green",
  not_interested: "gray",
  do_not_call: "red",
};

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  wrong_info: "Wrong Information",
  unreachable: "Unreachable",
  duplicate: "Duplicate Recruit",
  invalid_recruit: "Invalid Insurance Recruit",
  other: "Other",
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  denied: "Denied",
};

export const DISPUTE_STATUS_COLORS: Record<DisputeStatus, string> = {
  pending_review: "yellow",
  approved: "green",
  denied: "red",
};

export const RESOLUTION_ACTION_LABELS: Record<ResolutionAction, string> = {
  replace_recruit: "Replace Recruit",
  credit_agent: "Credit Agent",
  mark_invalid: "Mark as Invalid",
};
