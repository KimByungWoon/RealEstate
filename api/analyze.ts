// Vercel 환경에서는 이 파일이 자동으로 서버리스 함수로 처리됩니다.
// 로컬 테스트 시에는 Node.js 환경이 필요합니다.

import { GoogleGenAI } from "@google/genai";
import type { AnalysisParams } from '../types';

// Vercel 서버 환경에 저장된 API 키를 사용합니다.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // 서버 시작 시점에서 환경 변수가 없는 경우 에러를 발생시킵니다.
  throw new Error("API_KEY environment variable is not set in the server environment.");
}

const ai = new GoogleGenAI({ apiKey });

const generatePrompt = ({ industry, region, capital }: AnalysisParams): string => {
  return `
You are a world-class commercial district and startup investment consultant, specializing in guiding individuals towards successful and stable post-retirement businesses.
Based on the following information, provide a detailed and professional investment guide for a prospective entrepreneur in Korean.

**Input Information:**
*   **업종 (Industry):** ${industry}
*   **창업 희망 지역 (Desired Location):** ${region}
*   **초기 자본금 (Initial Capital):** ${capital}

**Please structure your analysis in the following format using markdown:**

### 1. 상권 종합 분석 (Overall Commercial District Analysis)
*   **지역 특징 및 유동인구 (Area Characteristics & Foot Traffic):** Detailed analysis of the area's vibe, main attractions, and the type and volume of foot traffic.
*   **주요 고객층 분석 (Target Audience Analysis):** Analyze the demographics, interests, and spending habits of the primary customer base.
*   **경쟁 환경 분석 (Competitive Landscape):** Identify key competitors, their strengths/weaknesses, and market saturation.

### 2. 예상 창업 비용 상세 (Detailed Estimated Startup Costs)
*   **보증금 및 월세 (Deposit & Rent):** Provide a realistic estimate for commercial properties in the area.
*   **인테리어 비용 (Interior Design Costs):** Estimate costs per square meter based on the industry standard.
*   **초도물품 및 장비 구매비 (Initial Supplies & Equipment):** List essential equipment and their estimated costs.
*   **마케팅 및 기타 비용 (Marketing & Miscellaneous):** Include costs for initial marketing, licenses, and unforeseen expenses.
*   **총계 및 자본금 대비 평가 (Total & Evaluation vs. Capital):** Sum up the costs and evaluate feasibility based on the provided capital.

### 3. 성공적인 창업을 위한 핵심 전략 (Key Strategies for a Successful Launch)
*   **메뉴/서비스 차별화 전략 (Menu/Service Differentiation Strategy):** Suggest unique selling propositions to stand out.
*   **타겟 고객 맞춤 마케팅 전략 (Targeted Marketing Strategy):** Propose effective online and offline marketing strategies.
*   **고객 경험 및 운영 전략 (Customer Experience & Operations Strategy):** Recommend ways to enhance customer satisfaction and operational efficiency.

### 4. 잠재적 리스크 및 관리 방안 (Potential Risks & Management Plan)
*   **상권 특성 기반 리스크 (Commercial District-Specific Risks):**
    *   **과도한 경쟁:** (분석) 동일/유사 업종의 밀집도, 대형 프랜차이즈의 존재 등을 분석하고, (대응 방안) 차별화 실패 시 발생할 수 있는 매출 부진 가능성과 구체적인 대응 전략(예: 특정 고객층 집중, 독특한 메뉴 개발, 강력한 로컬 마케팅)을 제시해주세요.
    *   **높은 임대료 및 변동성:** (분석) 해당 지역의 임대료 수준과 상승 추세를 분석하고, (대응 방안) 고정비 부담 증가로 인한 수익성 악화 가능성과 대응 방안(예: 장기 임대 계약, 소규모 매장 고려, 배달/테이크아웃 중심 운영)을 제시해주세요.
    *   **유동인구 특성 변화:** (분석) 특정 이벤트나 계절에 따라 유동인구가 급변할 가능성을 분석하고, (대응 방안) 비수기 매출 급감 리스크와 대응 방안(예: 시즌 메뉴 개발, 온라인 채널 강화, 단골 고객 확보 프로그램)을 제시해주세요.
*   **운영 및 재무 리스크 (Operational & Financial Risks):**
    *   **초기 예상 비용 초과:** (분석) 인테리어, 장비 구매 등에서 발생할 수 있는 예산 초과 가능성을 분석하고, (대응 방안) 추가 자금 조달의 어려움과 대응 방안(예: 예비비 최소 10~20% 확보, 단계적 투자 계획 수립)을 제시해주세요.
    *   **인력 수급 및 관리:** (분석) 해당 업종의 구인난, 높은 이직률 등을 분석하고, (대응 방안) 서비스 품질 저하 및 운영 차질 가능성과 대응 방안(예: 경쟁력 있는 급여 조건, 긍정적인 근무 환경 조성, 체계적인 교육 시스템)을 제시해주세요.
*   **외부 환경 리스크 (External Environment Risks):**
    *   **경제 침체 및 소비 심리 위축:** (분석) 경기 변동에 따른 소비자 지출 감소 가능성을 분석하고, (대응 방안) 매출 감소에 직접적인 영향을 미치는 리스크와 대응 방안(예: 가성비 메뉴 구성, 객단가 유지를 위한 프로모션, 비용 절감 노력)을 제시해주세요.

### 5. 최종 투자 가이드 요약 (Final Investment Guide Summary)
*   **투자 매력도 (Investment Attractiveness):** Rate as '상'(High), '중'(Medium), or '하'(Low).
*   **성공 가능성 (Probability of Success):** Provide a qualitative assessment.
*   **전문가 종합 의견 (Overall Expert Opinion):** Give a concluding expert opinion to the prospective entrepreneur, focusing on stability and long-term profitability for a post-retirement venture.

Provide a comprehensive, data-driven (even if simulated for illustrative purposes), and actionable guide.
  `;
};


// 이 함수는 Vercel에서 API 요청을 처리하는 핸들러 역할을 합니다.
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
    });
    
    const resultText = response.text;
    
    return res.status(200).json({ result: resultText });

  } catch (error) {
    console.error('Error in API route:', error);
    // Vercel 로그에서 자세한 에러를 확인할 수 있습니다.
    return res.status(500).json({ error: 'AI 분석 중 서버에서 오류가 발생했습니다.' });
  }
}
