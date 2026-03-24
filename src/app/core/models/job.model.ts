import { EntityId } from './entity-id.type';

export type JobStatus = 'open' | 'closed' | 'draft' | 'paused';

export interface Job {
  id: EntityId;
  title: string;
  tenantId: EntityId;
  status: JobStatus;
}

export type JobFormValue = Omit<Job, 'id'>;
