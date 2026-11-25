export interface QuestionOption {
  id?: number | string;
  option_text: string;
  option_key: string;
  is_correct: boolean;
  display_order?: number;
}

export interface Question {
  id: string | number;
  test_id?: number | string | null;
  subject_id?: number | string | null;
  topic_id?: number | string | null;
  subtopic_id?: number | string | null;
  question_text: string;
  question_type?: 'MCQ' | 'Numerical' | string;
  marks?: number;
  negative_marks?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  explanation?: string;
  options?: QuestionOption[];
  subject?: string | { id: number; name: string };
  topic?: string | { id: number; name: string };
  subtopic?: string | { id: number; name: string };
  is_new_draft?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionPayload {
  test_id?: number | string | null;
  subject_id?: number | string | null;
  topic_id?: number | string | null;
  subtopic_id?: number | string | null;
  question_text: string;
  question_type?: string;
  marks: number;
  negative_marks?: number;
  difficulty: string;
  explanation?: string;
  options: QuestionOption[];
  subject?: string;
  topic?: string;
  subtopic?: string;
}

