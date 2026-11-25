import apiClient, { getData, postData, putData, patchData, deleteData } from '../apiClient';
import { ENDPOINTS } from '../../constants/apiEndpoints';

export const testService = {
  getTests: async (params?: any) => {
    return await getData(ENDPOINTS.ADMIN_TESTS, params);
  },
  getTestDetails: async (id: string | number) => {
    return await getData(ENDPOINTS.ADMIN_TEST_DETAIL(id));
  },
  createTest: async (data: any) => {
    return await postData(ENDPOINTS.ADMIN_TESTS, data);
  },
  updateTest: async (id: string | number, data: any) => {
    return await putData(ENDPOINTS.ADMIN_TEST_DETAIL(id), data);
  },
  deleteTest: async (id: string | number) => {
    return await deleteData(ENDPOINTS.ADMIN_TEST_DETAIL(id));
  },
  publishTest: async (id: string | number, isPublished: boolean = true) => {
    return await patchData(ENDPOINTS.ADMIN_TEST_PUBLISH(id), { is_published: isPublished });
  },
  assignQuestionsToTest: async (testId: string | number, questionIds: (number | string)[]) => {
    return await postData(ENDPOINTS.ADMIN_TEST_QUESTIONS(testId), {
      question_ids: questionIds.map(Number),
    });
  },
  autoPopulateTestQuestions: async (
    testId: string | number,
    payload: { count: number; topic_id: number | string; difficulty?: string }
  ) => {
    return await postData(ENDPOINTS.ADMIN_TEST_AUTO_POPULATE(testId), {
      count: Number(payload.count),
      topic_id: Number(payload.topic_id),
      ...(payload.difficulty ? { difficulty: payload.difficulty } : {}),
    });
  },
};

export const getTests = testService.getTests;
export default testService;
