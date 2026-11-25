export interface Subtopic {
  id: number | string;
  topic_id?: number | string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: number | string;
  subject_id?: number | string;
  name: string;
  description?: string;
  is_active?: boolean;
  subtopics?: Subtopic[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string | number;
  name: string;
  description?: string;
  topics?: Topic[];
  topic_count?: number;
  test_count?: number;
  display_order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamHierarchySubject extends Subject {
  topics: (Topic & { subtopics: Subtopic[] })[];
}

export interface ExamHierarchy {
  id: number | string;
  name: string;
  subjects: ExamHierarchySubject[];
}

