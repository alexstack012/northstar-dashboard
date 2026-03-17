export type CandidateStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'placed'
  | 'rejected';

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  jobId: number;
  status: CandidateStatus;
  notes: string;
}

export type CandidateFormValue = Omit<Candidate, 'id'>;
