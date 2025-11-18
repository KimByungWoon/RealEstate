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
Based on the following information, provide a detailed and professional investment guide for a prospective entrepreneur in Korean. Your analysis must be incredibly specific, actionable, and data-driven (use realistic, simulated data for examples).

**Input Information:**
*   **업종 (Industry):** ${industry}
*   **창업 희망 지역 (Desired Location):** ${region}
*   **초기 자본금 (Initial Capital):** ${capital}

**Please structure your analysis in the following format using markdown:**

### 1. 핵심 요약 및 추천 후보지
*   **종합 의견:** 현재 조건(업종, 지역, 자본금)을 바탕으로 한 창업의 전반적인 매력도와 성공 가능성을 요약합니다.
*   **추천 후보지 (1~2곳):** '${region}' 내에서, 가상의 상권 분석 데이터를 (예: 1일 유동인구, 아파트 밀집도, 주변 시설) 바탕으로 가장 유망한 **세부 위치**를 1~2곳 추천하고 그 이유를 구체적으로 설명해주세요. (예: 분당 정자동 카페거리 인근, 서현역 로데오거리 이면도로)

### 2. 상권 종합 분석
*   **지역 특징 및 유동인구:** 지역의 분위기, 주요 시설, 유동인구의 규모와 특징(연령대, 성별, 시간대별)을 상세히 분석합니다.
*   **주요 고객층 분석:** 해당 상권의 주된 고객층의 인구통계학적 특성, 소비 성향, 관심사를 분석합니다.
*   **경쟁 환경 및 유사업종 분포:** 주요 경쟁 업체를 식별하고, 그들의 강점/약점을 분석합니다. 또한, 지도상의 분포처럼 **'${region}' 내 유사업종의 밀집도와 분포 현황**을 분석하여 시장 포화도를 평가합니다.

### 3. 예상 창업 비용 및 자본금 상세 분석
*   **항목별 상세 비용:** 보증금/월세, 인테리어(평당 단가 기준), 초도물품/장비, 마케팅, 각종 인허가 비용을 현실적인 추정치로 상세히 분류합니다.
*   **자본금 운용 계획:** 주어진 초기 자본금('${capital}')을 각 항목에 어떻게 배분해야 하는지 계획을 제시합니다. 특히, **총 자본금의 20-30%를 예상치 못한 비용을 위한 예비비로 책정**하는 것을 강조해주세요.
*   **총계 및 자본금 대비 평가:** 비용 총계를 계산하고, 주어진 자본금으로 창업이 가능한지, 혹은 빠듯한지, 여유로운지를 평가합니다.

### 4. 창업 준비과정 로드맵 (단계별 체크리스트)
1.  **D-90: 사업 계획 및 등록:** 사업 계획 구체화, 상호 결정, 사업자 등록(개인/법인) 및 관련 서류 준비.
2.  **D-60: 입지 선정 및 계약:** 추천 후보지를 중심으로 점포 물색, 상권 실사, 임대차 계약 체결.
3.  **D-45: 설계 및 인테리어:** 인테리어 컨셉 확정, 업체 선정 및 공사 계약.
4.  **D-20: 인허가 및 인력 채용:** 업종 관련 인허가(예: 영업신고증, 위생교육필증) 취득, 직원 채용 공고 및 면접.
5.  **D-10: 장비/물품 구매 및 마케팅 시작:** 주방 설비, 가구, 초도물품 입고, 온라인 채널(SNS) 개설 및 오픈 이벤트 홍보 시작.
6.  **D-3: 최종 점검:** 시설 최종 점검, 직원 교육, 시범 운영.
7.  **D-Day: 그랜드 오픈.**

### 5. 성공적인 창업을 위한 핵심 전략
*   **메뉴/서비스 차별화 전략:** 경쟁업체와 차별화될 수 있는 독창적인 메뉴나 서비스 포인트를 제안합니다.
*   **타겟 고객 맞춤 마케팅 전략:** 분석된 주요 고객층에게 효과적으로 도달할 수 있는 온라인/오프라인 마케팅 방안을 제시합니다. (예: 지역 커뮤니티 활용, SNS 타겟 광고)
*   **고객 경험 및 운영 전략:** 고객 만족도를 높이고 재방문을 유도할 수 있는 운영 노하우를 제안합니다.

### 6. 잠재적 리스크 및 관리 방안
*   **상권 특성 기반 리스크:** (분석) 과도한 경쟁, 높은 임대료, 유동인구 변화 가능성. (대응 방안) 구체적인 대응 전략 제시.
*   **운영 및 재무 리스크:** (분석) 예상 비용 초과, 인력 수급 문제. (대응 방안) 예비비 확보, 체계적인 인력 관리 시스템 제안.
*   **외부 환경 리스크:** (분석) 경제 침체, 소비 심리 위축. (대응 방안) 가성비 메뉴 개발, 비용 절감 노력 제안.

### 7. 세무 및 추가 정보
*   **저렴한 세무 서비스 추천:** 개인사업자/소상공인이 저렴하게 이용할 수 있는 **세무 서비스 플랫폼(예: 삼쩜삼, 자비스, 이지샵 자동장부 등)**을 2~3개 추천하고, 각각의 장단점을 간략히 설명해주세요. (주의: 특정 세무사를 직접 추천하는 대신 플랫폼/서비스 위주로 안내).
*   **정부 지원 정책:** 창업자가 활용할 수 있는 정부의 소상공인 지원 정책이나 저금리 대출 상품을 간략히 언급합니다.

### 8. 최종 투자 가이드 요약
*   **투자 매력도:** '상'(High), '중'(Medium), '하'(Low)로 평가.
*   **성공 가능성:** 종합적인 성공 가능성을 질적으로 평가.
*   **전문가 종합 의견:** 예비 창업자에게 안정적이고 장기적인 수익성을 위한 최종 조언을 제공하며 마무리합니다.

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