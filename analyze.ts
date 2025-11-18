// Vercel 환경에서는 이 파일이 자동으로 서버리스 함수로 처리됩니다.
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisParams } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable is not set in the server environment.");
}

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    coreSummaryAndRecommendations: {
      type: Type.STRING,
      description: "### 1. 핵심 요약 및 추천 후보지\n*   **종합 의견:**\n*   **추천 후보지 (1~2곳):**"
    },
    commercialDistrictAnalysis: {
      type: Type.OBJECT,
      properties: {
        text: {
          type: Type.STRING,
          description: "### 2. 상권 종합 분석\n*   **지역 특징 및 유동인구:**\n*   **주요 고객층 분석:**\n*   **경쟁 환경 및 유사업종 분포:**"
        },
        customerDemographics: {
          type: Type.ARRAY,
          description: "주요 고객층의 연령대별 분포. 합계는 100이 되도록. 예: 20대, 30대, 40대, 50대 이상",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              value: { type: Type.NUMBER }
            }
          }
        },
        footTraffic: {
          type: Type.ARRAY,
          description: "시간대별 유동인구. 가상의 수치(1~100)로 표현. 예: 오전, 점심, 오후, 저녁, 심야",
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              value: { type: Type.NUMBER }
            }
          }
        },
        competitorDensity: {
          type: Type.ARRAY,
          description: "주요 경쟁업체 2-3곳의 경쟁력 점수. 가상의 수치(1~100)로 표현.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.NUMBER }
            }
          }
        },
      }
    },
    costAnalysis: {
      type: Type.STRING,
      description: "### 3. 예상 창업 비용 및 자본금 상세 분석\n마크다운 표 형식 포함"
    },
    roadmap: {
      type: Type.STRING,
      description: "### 4. 창업 준비과정 상세 로드맵 (D-90 ~ D-Day)\n상세 체크리스트 형식"
    },
    successStrategies: {
      type: Type.STRING,
      description: "### 5. 성공적인 창업을 위한 핵심 전략"
    },
    riskAnalysis: {
      type: Type.STRING,
      description: "### 6. 잠재적 리스크 및 관리 방안"
    },
    taxAndInfo: {
      type: Type.STRING,
      description: "### 7. 세무 및 추가 정보"
    },
    finalSummary: {
      type: Type.STRING,
      description: "### 8. 최종 투자 가이드 요약"
    }
  }
};

const generatePrompt = ({ industry, region, capital, lat, lng }: AnalysisParams): string => {
  const locationInfo = lat && lng 
    ? `*   **세부 분석 위치 (위/경도):** ${lat.toFixed(5)}, ${lng.toFixed(5)} (이 특정 좌표를 중심으로 매우 상세하게 분석해주세요.)\n` 
    : '';

  return `
You are a world-class commercial district and startup investment consultant.
Based on the following information, provide a detailed and professional investment guide for a prospective entrepreneur in Korean.
Your analysis must be incredibly specific, actionable, and data-driven (use realistic, simulated data for examples).
Fill the provided JSON schema with comprehensive information. All text content must be in Markdown format.

**Input Information:**
*   **업종 (Industry):** ${industry}
*   **창업 희망 지역 (Desired Location):** ${region}
${locationInfo}*   **초기 자본금 (Initial Capital):** ${capital}
`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const params: AnalysisParams = req.body;
    if (!params.industry || !params.region || !params.capital) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const prompt = generatePrompt(params);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    // Gemini's JSON output is a string that needs to be parsed.
    const resultObject = JSON.parse(response.text);
    
    return res.status(200).json({ result: resultObject });

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'AI 분석 중 서버에서 오류가 발생했습니다.' });
  }
}