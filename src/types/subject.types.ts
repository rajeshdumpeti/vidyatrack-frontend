export type Subject = {
  id: number;
  name: string;
  created_at?: string;
};

export type SubjectCreateInput = {
  name: string;
};
