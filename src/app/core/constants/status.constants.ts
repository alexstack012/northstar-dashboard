import { JobStatus } from '../models/job.model';
import { CandidateStatus } from '../models/candidate.model';

export const JOB_STATUS_OPTIONS: ReadonlyArray<{ value: JobStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' }
] as const;

export const CANDIDATE_STATUS_OPTIONS: ReadonlyArray<{ value: CandidateStatus; label: string }> = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' }
] as const;
