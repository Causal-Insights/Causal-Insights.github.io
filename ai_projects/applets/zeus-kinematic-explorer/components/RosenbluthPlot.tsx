
import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ErrorBar,
  ReferenceLine
} from 'recharts';
import { RosenbluthPoint } from '../types';

interface Props {
  data: RosenbluthPoint[];
  slope: number;
  intercept: number;
}

const RosenbluthPlot: React.FC<Props> = ({ data, slope, intercept }) => {
  
  // Generate points for the fit line based on current slope/intercept
  const lineData = [
    { x: 0, y: intercept },
    { x: 0.7, y: slope * 0.7 + intercept }
  ];

  const estimatedFL = -slope;

  return (
    <div className="w-full h-80 bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Rosenbluth Plot
          </h3>
          <p className="text-xs text-slate-400">
            Isolating F<sub>L</sub> from ISR Events at Q² ≈ 20 GeV²
          </p>
        </div>
        <div className="text-right bg-slate-900 p-2 rounded border border-slate-700">
          <div className="text-xs text-slate-500">Estimated F<sub>L</sub></div>
          <div className={`text-lg font-mono font-bold ${Math.abs(estimatedFL - 0.25) < 0.05 ? 'text-green-400' : 'text-blue-400'}`}>
            {estimatedFL.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500">True Value: 0.250</div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis 
              dataKey="yTerm" 
              type="number" 
              domain={[0, 0.7]} 
              label={{ value: 'y² / Y+', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 12 }}
              tick={{fill: '#94a3b8', fontSize: 11}}
            />
            <YAxis 
              dataKey="reducedCrossSection" 
              domain={[0.3, 0.6]} 
              label={{ value: 'Reduced Cross Section σᵣ', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
              tick={{fill: '#94a3b8', fontSize: 11}}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={() => ''}
            />
            
            {/* The Fit Line */}
            <Line 
              data={lineData} 
              dataKey="y" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false} 
              activeDot={false}
              name="Fit"
              isAnimationActive={false}
            />

            {/* The Measurements */}
            <Scatter name="Measurements" data={data} fill="#ef4444" shape="circle">
              <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#ffffff" direction="y" />
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RosenbluthPlot;
