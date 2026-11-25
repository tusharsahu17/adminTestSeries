export type TestType = 'full_length' | 'topic_wise' | 'multi_topic' | 'chapter';
export type TestDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Test {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
  exam_id?: number | null;
  subject_id?: number | null;
  test_type?: TestType | string;
  topic_id?: number | null;
  subtopic_id?: number | null;
  topic_ids?: number[];
  duration_minutes?: number;
  duration?: number;
  total_marks?: number;
  passing_marks?: number;
  negative_marking?: number;
  negative_marks?: number;
  difficulty?: TestDifficulty | string;
  is_free?: boolean;
  is_published?: boolean;
  status?: string;
  total_questions?: number;
  questions_count?: number;
  questions?: any[];
  topic?: {
    id: number;
    name: string;
  };
  subtopic?: {
    id: number;
    name: string;
  };
  subject?: {
    id: number;
    name: string;
  };
  exam?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTopicWiseTestPayload {
  exam_id?: number | null;
  subject_id: number;
  test_type: 'topic_wise' | 'full_length' | 'multi_topic' | string;
  topic_id?: number | null;
  subtopic_id?: number | null;
  topic_ids?: number[];
  name: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  negative_marking: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  is_free?: boolean;
  is_published?: boolean;
}

export interface AutoPopulateQuestionsPayload {
  count: number;
  topic_id: number;
  difficulty?: string;
}

export interface AssignQuestionsToTestPayload {
  question_ids: number[];
}

export interface PublishTestPayload {
  is_published: boolean;
}

