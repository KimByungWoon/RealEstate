import React, { useState, useCallback, useEffect } from 'react';
import { getInvestmentGuide } from './services/geminiService';
import type { AnalysisParams, AnalysisResponse } from './types';
import { BuildingStorefrontIcon, MapPinIcon, CircleStackIcon, SparklesIcon, ChartPieIcon } from './components/icons';
import { CustomerDemographicsChart, FootTrafficChart, CompetitorDensityChart } from './components/AnalysisCharts';
import ReactMarkdown from 'react-markdown';
import { NaverMap } from './components/NaverMap';

declare global {
    interface Window { naver: any; }
}

const Header: React.FC = () => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="container mx-auto px-4 py-4 flex items-center gap-3">
      <SparklesIcon className="w-8 h-8 text-sky-600" />
      <div>
          <h1 className="text-2xl font-bold text-slate-900">
           성공 투자를 위한 AI 상권 분석 & 투자 가이드
          </h1>
          <p className="text-sm text-slate-500">
          성공적인 창업을 위한 맞춤형 분석을 제공합니다.
          </p>
      </div>
    </div>
  </header>
);

const InputField: React.FC<{
  id: keyof Omit<AnalysisParams, 'lat' | 'lng'>;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, placeholder, icon, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-base font-semibold text-slate-700 mb-2">{label}</label>
    <div className="relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      <input
        type="text"
        name={id}
        id={id}
        className="block w-full rounded-lg border-sky-300 bg-white/70 backdrop-blur-sm pl-10 focus:border-sky-500 focus:ring-sky-500 focus:bg-white sm:text-sm py-3 transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const App: React.FC = () => {
  const [params, setParams] = useState<Omit<AnalysisParams, 'lat' | 'lng'>>({
    industry: '노브랜드 햄버거',
    region: '경기 분당',
    capital: '1억 5천만원',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);

  useEffect(() => {
    const loadNaverMapsApi = async () => {
      try {
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            let errorText = `Server error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorText = errorData.error || errorText;
            } catch (e) {
                // The response body was not JSON, use raw text.
                errorText = await response.text();
            }
            throw new Error(`Failed to load map configuration. Details: ${errorText}`);
        }

        const config = await response.json();
        const naverClientId = config.naverClientId;

        if (!naverClientId) {
          throw new Error("Naver Client ID was not found in the server's response.");
        }

        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverClientId}&submodules=geocoder`;
        script.async = true;
        script.onload = () => {
          setIsMapApiLoaded(true);
        };
        script.onerror = () => {
            console.error("The Naver Maps script failed to load. Check the Client ID and network access.");
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error("Failed to load Naver Maps API:", error);
      }
    };

    loadNaverMapsApi();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'region') {
        setMapCenter(null);
        setSelectedLocation(null);
        setAnalysisResult(null);
    }
    setParams(prev => ({ ...prev, [name]: value as string }));
  };

  const geocodeAddress = (address: string): Promise<{ lat: number, lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!isMapApiLoaded || !window.naver || !window.naver.maps || !window.naver.maps.Service) {
        return reject(new Error("Naver Maps API is not ready."));
      }
      window.naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          return reject(new Error('Geocoding failed for address: ' + address));
        }
        const result = response.v2.addresses[0];
        if (result) {
            resolve({ lat: parseFloat(result.y), lng: parseFloat(result.x) });
        } else {
            reject(new Error('No results found for address: ' + address));
        }
      });
    });
  };

  const handleMapClick = useCallback((coords: { lat: number, lng: number }) => {
    setSelectedLocation(coords);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.industry || !params.region || !params.capital) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const shouldGeocode = !mapCenter;

    try {
      const apiParams: AnalysisParams = { 
        ...params,
        ...(selectedLocation && { lat: selectedLocation.lat, lng: selectedLocation.lng })
      };
      const result = await getInvestmentGuide(apiParams);
      setAnalysisResult(result);

      if (shouldGeocode && isMapApiLoaded) {
        try {
          const coords = await geocodeAddress(params.region);
          setMapCenter(coords);
          if (!selectedLocation) {
            setSelectedLocation(coords);
          }
        } catch (mapError) {
            console.warn("Map geocoding failed:", mapError);
            setMapCenter(null);
            setSelectedLocation(null);
        }
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('분석 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [params, isMapApiLoaded, mapCenter, selectedLocation]);

  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col items-center justify-center text-center">
            <svg className="animate-spin h-12 w-12 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-slate-600 font-medium">상권 데이터를 분석하고 있습니다. 잠시만 기다려주세요...</p>
            <p className="mt-2 text-sm text-slate-500">이 과정은 최대 1분 정도 소요될 수 있습니다.</p>
        </div>
      );
    }

    if (error && !analysisResult) { // Only show full-screen error if there's no result to display
        return (
             <div className="bg-red-50 p-6 rounded-2xl border border-red-200 h-full flex flex-col items-center justify-center text-center">
                <p className="text-red-700 font-medium">{error}</p>
            </div>
        )
     }

    if (analysisResult) {
      const { commercialDistrictAnalysis } = analysisResult;
      return (
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
            AI 상권 분석 리포트
          </h2>
          <article className="prose prose-lg max-w-none prose-h3:text-sky-700 prose-h3:font-semibold prose-strong:text-slate-800 prose-li:marker:text-sky-600">
             <ReactMarkdown>{analysisResult.coreSummaryAndRecommendations}</ReactMarkdown>
             <ReactMarkdown>{commercialDistrictAnalysis.text}</ReactMarkdown>
          </article>
            
          <div className="my-10 space-y-12">
            <CustomerDemographicsChart data={commercialDistrictAnalysis.customerDemographics} />
            <FootTrafficChart data={commercialDistrictAnalysis.footTraffic} />
            <CompetitorDensityChart data={commercialDistrictAnalysis.competitorDensity} />
          </div>

          <article className="prose prose-lg max-w-none prose-h3:text-sky-700 prose-h3:font-semibold prose-strong:text-slate-800 prose-li:marker:text-sky-600">
            <ReactMarkdown>{analysisResult.costAnalysis}</ReactMarkdown>
            <ReactMarkdown>{analysisResult.roadmap}</ReactMarkdown>
            <ReactMarkdown>{analysisResult.successStrategies}</ReactMarkdown>
            <ReactMarkdown>{analysisResult.riskAnalysis}</ReactMarkdown>
            <ReactMarkdown>{analysisResult.taxAndInfo}</ReactMarkdown>
            <ReactMarkdown>{analysisResult.finalSummary}</ReactMarkdown>
          </article>
        </div>
      );
    }

    return (
       <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col items-center justify-center text-center">
          <SparklesIcon className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700">리포트가 여기에 표시됩니다.</h2>
          <p className="mt-2 text-slate-500">좌측에 분석 조건을 입력하고 'AI 분석 시작하기' 버튼을 클릭하세요.</p>
      </div>
    )
  }
  
  const buttonText = selectedLocation && analysisResult ? '선택 위치