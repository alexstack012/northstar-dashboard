import { EntityId } from './entity-id.type';

export type CandidateStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'placed'
  | 'rejected';

export interface Candidate {
  id: EntityId;
  name: string;
  email: string;
  phone: string;
  jobId: EntityId;
  status: CandidateStatus;
  notes: string;
}

export type CandidateFormValue = Omit<Candidate, 'id'>;
