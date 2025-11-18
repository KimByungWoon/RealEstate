
import React, { useState, useCallback, useEffect } from 'react';
import { getInvestmentGuide } from './services/geminiService';
import type { AnalysisParams } from './types';
import { BuildingStorefrontIcon, MapPinIcon, CircleStackIcon, SparklesIcon, ChartPieIcon } from './components/icons';
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
  id: keyof AnalysisParams;
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
  const [params, setParams] = useState<AnalysisParams>({
    industry: '노브랜드 햄버거',
    region: '경기 분당',
    capital: '1억 5천만원',
  });
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | null>(null);
  const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);

  useEffect(() => {
    const loadNaverMapsApi = async () => {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        const naverClientId = config.naverClientId;

        if (!naverClientId) {
          console.error("Naver Client ID is not configured.");
          return;
        }

        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverClientId}&submodules=geocoder`;
        script.async = true;
        script.onload = () => {
          setIsMapApiLoaded(true);
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
    setParams(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.industry || !params.region || !params.capital) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    setMapCenter(null);

    try {
      const result = await getInvestmentGuide(params);
      setAnalysisResult(result);

      if (isMapApiLoaded) {
        try {
          const coords = await geocodeAddress(params.region);
          setMapCenter(coords);
        } catch (mapError) {
          console.warn("Map geocoding failed:", mapError);
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
  }, [params, isMapApiLoaded]);

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

    if (error) {
        return (
             <div className="bg-red-50 p-6 rounded-2xl border border-red-200 h-full flex flex-col items-center justify-center text-center">
                <p className="text-red-700 font-medium">{error}</p>
            </div>
        )
     }

    if (analysisResult) {
      return (
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
            AI 상권 분석 리포트
          </h2>
          <article className="prose prose-lg max-w-none prose-h3:text-sky-700 prose-h3:font-semibold prose-strong:text-slate-800 prose-li:marker:text-sky-600">
             <ReactMarkdown>{analysisResult}</ReactMarkdown>
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-4">
                    <div className="sticky top-24 bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl shadow-lg border border-sky-200 overflow-hidden">
                        <div className="relative p-8 bg-gradient-to-r from-sky-600 to-blue-700">
                            <ChartPieIcon className="w-24 h-24 text-sky-400/20 absolute -top-2 -right-4" />
                            <h2 className="text-2xl font-bold text-yellow-300 mb-1">분석 조건 입력</h2>
                            <p className="text-sky-200 text-sm">성공적인 창업을 위한 첫 걸음</p>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                            <InputField
                                id="industry"
                                label="업종"
                                placeholder="예: 노브랜드 햄버거, 소규모 와인바, 메가커피"
                                icon={<BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />}
                                value={params.industry}
                                onChange={handleInputChange}
                            />
                            <InputField
                                id="region"
                                label="창업 희망 지역"
                                placeholder="예: 서울 강남구, 부산 해운대구"
                                icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                                value={params.region}
                                onChange={handleInputChange}
                            />
                            <InputField
                                id="capital"
                                label="초기 자본금"
                                placeholder="예: 1억원, 5천만원"
                                icon={<CircleStackIcon className="h-5 w-5 text-gray-400" />}
                                value={params.capital}
                                onChange={handleInputChange}
                            />

                            <div className="pt-2">
                                <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out"
                                >
                                <SparklesIcon className="w-5 h-5" />
                                {isLoading ? '분석 중...' : 'AI 분석 시작하기'}
                                </button>
                            </div>
                            {error && !isLoading && (
                                <p className="mt-2 text-sm text-center text-red-600">{error}</p>
                            )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="mt-8 lg:mt-0">
                        {renderContent()}
                    </div>
                    {mapCenter && (
                        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MapPinIcon className="w-6 h-6 text-sky-600"/>
                                창업 희망 지역 지도
                            </h3>
                            <NaverMap center={mapCenter} />
                        </div>
                    )}
                </div>
            </div>
        </main>
        
        <footer className="text-center mt-8 py-6 text-sm text-slate-500 border-t border-slate-200">
            <p>&copy; {new Date().getFullYear()} AI Commercial District Analysis for Successful Investment. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default App;
