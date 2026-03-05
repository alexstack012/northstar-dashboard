export interface Job {
  id: number;
  title: string;
  tenantId: number;
  status: 'open' | 'closed' | 'draft' | 'paused' | string;
}
