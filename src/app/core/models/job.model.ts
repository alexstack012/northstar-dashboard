export type JobStatus = 'open' | 'closed' | 'draft' | 'paused';

export interface Job {
  id: number;
  title: string;
  tenantId: number;
  status: JobStatus;
}

export type JobFormValue = Omit<Job, 'id'>;
