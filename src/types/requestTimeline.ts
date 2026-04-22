export interface RequestTimelineEntry {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  userId: number | null;
  userEmail: string;
  userType: string;
  note: string | null;
  createdAt: string;
}
