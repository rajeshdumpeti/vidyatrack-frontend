export type Subject = {
  id: number;
  public_id?: string;
  name: string;
  created_at?: string;
};

export type SubjectCreateInput = {
  name: string;
};
