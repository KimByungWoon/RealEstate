import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { DemographicsData, FootTrafficData, CompetitorData } from '../types';

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
    <h4 className="text-xl font-semibold text-slate-800 mb-6 text-center">{title}</h4>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </div>
);

// --- Demographics Chart (Pie) ---
const COLORS = ['#0ea5e9', '#67e8f9', '#a5f3fc', '#e0f2fe', '#f0f9ff'];

export const CustomerDemographicsChart: React.FC<{ data: DemographicsData[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <ChartContainer title="주요 고객층 연령대 분포">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// --- Foot Traffic Chart (Bar) ---
export const FootTrafficChart: React.FC<{ data: FootTrafficData[] }> = ({ data }) => {
   if (!data || data.length === 0) return null;
  return (
    <ChartContainer title="시간대별 유동인구 패턴">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="유동인구" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// --- Competitor Density Chart (Bar) ---
export const CompetitorDensityChart: React.FC<{ data: CompetitorData[] }> = ({ data }) => {
   if (!data || data.length === 0) return null;
  return (
    <ChartContainer title="주요 경쟁업체 경쟁력 분석">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="경쟁력 점수" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};