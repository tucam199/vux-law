export interface Penalty {
  type: 'fine' | 'restriction';
  amount?: number;
  details?: string;
}

export interface Regulation {
  id: string;
  category: string;
  violation: string;
  penalty: Penalty;
}

export interface ViolationRecord {
  id: string;
  personName: string;
  date: string;
  notes?: string;
  regulation: Regulation;
  isCompleted?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
  createdAt?: string;
}
