import type { AnalysisParams } from '../types';

export const getInvestmentGuide = async (params: AnalysisParams): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `AI 분석 중 서버 오류가 발생했습니다.`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching investment guide:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("AI 분석 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};