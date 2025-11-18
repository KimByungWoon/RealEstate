export interface AnalysisParams {
  industry: string;
  region: string;
  capital: string;
  lat?: number;
  lng?: number;
}

// Chart Data Types
export interface DemographicsData {
  name: string;
  value: number;
  // Fix: Add index signature for recharts compatibility.
  [key: string]: any;
}

export interface FootTrafficData {
  time: string;
  value: number;
  // Fix: Add index signature for recharts compatibility.
  [key: string]: any;
}

export interface CompetitorData {
  name: string;
  score: number;
  // Fix: Add index signature for recharts compatibility.
  [key: string]: any;
}

// Main AI Response Type
export interface AnalysisResponse {
  coreSummaryAndRecommendations: string;
  commercialDistrictAnalysis: {
    text: string;
    customerDemographics: DemographicsData[];
    footTraffic: FootTrafficData[];
    competitorDensity: CompetitorData[];
  };
  costAnalysis: string;
  roadmap: string;
  successStrategies: string;
  riskAnalysis: string;
  taxAndInfo: string;
  finalSummary: string;
}