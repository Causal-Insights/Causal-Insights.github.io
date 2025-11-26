
import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend
} from 'recharts';
import { PhysicsEvent } from '../types';
import { getKinematicLimit } from '../services/physicsEngine';

interface Props {
  events: PhysicsEvent[];
  currentBeam: string;
}

const KinematicPlane: React.FC<Props> = ({ events }) => {
  
  // Generate reference lines for the kinematic limits (y=1)
  const limitHER = getKinematicLimit('HER');
  const limitMER = getKinematicLimit('MER');
  const limitLER = getKinematicLimit('LER');

  // Separate data series
  const eventsHER = events.filter(e => !e.isISR && e.beamEnergy === 'HER');
  const eventsMER = events.filter(e => !e.isISR && e.beamEnergy === 'MER');
  const eventsLER = events.filter(e => !e.isISR && e.beamEnergy === 'LER');
  const eventsISR = events.filter(e => e.isISR);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Guard clause: If it's a kinematic limit point (no 'y' property), don't show tooltip
      if (typeof data.y === 'undefined') return null;

      const eventData = data as PhysicsEvent;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs z-50">
          <p className="font-bold text-slate-200 mb-1 border-b border-slate-700 pb-1">
            {eventData.isISR ? 'ISR Event (Reduced Energy)' : `${eventData.beamEnergy} Standard DIS`}
          </p>
          <div className="space-y-1">
            <p><span className="text-slate-500">Q²:</span> <span className="text-blue-400">{eventData.Q2?.toFixed(1)} GeV²</span></p>
            <p><span className="text-slate-500">x:</span> <span className="text-green-400">{eventData.x?.toExponential(2)}</span></p>
            <p><span className="text-slate-500">y:</span> <span className="text-purple-400">{eventData.y?.toFixed(3)}</span></p>
            {eventData.isISR && (
              <>
                <p className="mt-2 text-yellow-500 font-semibold">ISR Photon:</p>
                <p>E_gamma: {eventData.E_gamma?.toFixed(1)} GeV</p>
                <p>√s_eff: {eventData.s ? Math.sqrt(eventData.s).toFixed(1) : ''} GeV</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Explicit ticks to force integer exponents on the Log plot
  // This prevents labels like 10^2.3
  const xTicks = [0.00001, 0.0001, 0.001, 0.01, 0.1, 1];
  const yTicks = [1, 10, 100, 1000, 10000, 50000];

  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-lg flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-200">The Kinematic Plane (Q² vs x)</h2>
          <p className="text-sm text-slate-400">
            Comparison of phase space coverage for different beam energies and ISR.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            
            {/* Logarithmic X Axis: Bjorken x */}
            <XAxis 
              type="number" 
              dataKey="x" 
              name="x" 
              scale="log" 
              domain={[0.00001, 1.0]} 
              ticks={xTicks}
              tickFormatter={(val) => `10^${Math.round(Math.log10(val))}`}
              stroke="#64748b"
              allowDataOverflow
            >
              <Label value="Bjorken x" offset={0} position="insideBottom" fill="#94a3b8" />
            </XAxis>

            {/* Logarithmic Y Axis: Q2 */}
            <YAxis 
              type="number" 
              dataKey="Q2" 
              name="Q²" 
              scale="log" 
              domain={[1, 50000]} 
              ticks={yTicks}
              tickFormatter={(val) => {
                // Special handling for the top tick to look clean
                if (val === 50000) return ""; 
                return `10^${Math.round(Math.log10(val))}`;
              }}
              stroke="#64748b"
              allowDataOverflow
            >
              <Label value="Q² (GeV²)" angle={-90} position="insideLeft" fill="#94a3b8" />
            </YAxis>

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36}/>

            {/* Data Series */}
            <Scatter name="HER (920 GeV)" data={eventsHER} fill="#3b82f6" shape="circle" />
            <Scatter name="MER (575 GeV)" data={eventsMER} fill="#22c55e" shape="triangle" />
            <Scatter name="LER (460 GeV)" data={eventsLER} fill="#ef4444" shape="square" />
            <Scatter name="ISR (Radiative)" data={eventsISR} fill="#eab308" shape="star" />

            {/* Kinematic Limit Lines */}
            <Scatter name="Limit HER" data={limitHER} line={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} shape={() => <g></g>} legendType="none" />
            <Scatter name="Limit MER" data={limitMER} line={{ stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5 5' }} shape={() => <g></g>} legendType="none" />
            <Scatter name="Limit LER" data={limitLER} line={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }} shape={() => <g></g>} legendType="none" />

          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KinematicPlane;
