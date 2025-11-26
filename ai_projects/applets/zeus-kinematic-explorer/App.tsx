
import React, { useState, useEffect, useRef } from 'react';
import { generateEvent } from './services/physicsEngine';
import DetectorVisualization from './components/DetectorVisualization';
import KinematicPlane from './components/KinematicPlane';
import { ParticleType, SimulationStats, PhysicsEvent, BeamEnergyType } from './types';
import { Settings, Play, Pause, RefreshCw, Zap, Gauge, Info, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [isRunning, setIsRunning] = useState(false);
  
  // Simulation Control
  const [beamEnergy, setBeamEnergy] = useState<BeamEnergyType>('ALL'); // Default to ALL
  const [enableISR, setEnableISR] = useState<boolean>(true);
  
  // Data Buffers
  const [displayEvents, setDisplayEvents] = useState<PhysicsEvent[]>([]);
  
  // Stats
  const [stats, setStats] = useState<SimulationStats>({
    totalEvents: 0,
    ISREvents: 0,
    integratedLuminosity: 0,
  });

  // Visualization Data
  const [activeEvent, setActiveEvent] = useState<{ type: ParticleType; angle: number; hasPhoton: boolean; photonAngle: number; photonDetected: boolean; beamEnergy: string } | null>(null);

  // Animation Frame Ref
  const requestRef = useRef<number>(0);

  // --- Simulation Logic ---
  const runSimulationStep = () => {
    const batchSize = 5; 
    const newEvents: PhysicsEvent[] = [];
    let isrCount = 0;

    for (let i = 0; i < batchSize; i++) {
      const event = generateEvent(stats.totalEvents + i, beamEnergy, enableISR);
      if (event.isISR) isrCount++;
      newEvents.push(event);

      // Update Visualization for the last event in batch
      if (i === batchSize - 1) {
        const angle = 10 + (event.y * 160); 
        const theta_gamma = event.isISR ? (Math.random() * 0.5) : 0; 
        
        setActiveEvent({
          type: ParticleType.ELECTRON,
          angle: angle,
          hasPhoton: event.isISR,
          photonAngle: theta_gamma,
          photonDetected: event.detected,
          beamEnergy: event.beamEnergy
        });
      }
    }

    setDisplayEvents(prev => {
      const updated = [...prev, ...newEvents];
      if (updated.length > 800) {
        return updated.slice(updated.length - 800);
      }
      return updated;
    });

    setStats(prev => ({
      totalEvents: prev.totalEvents + batchSize,
      ISREvents: prev.ISREvents + isrCount,
      integratedLuminosity: prev.integratedLuminosity + 0.01,
    }));

    if (isRunning) {
      requestRef.current = requestAnimationFrame(runSimulationStep);
    }
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(runSimulationStep);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, beamEnergy, enableISR]); 

  const resetSimulation = () => {
    setIsRunning(false);
    setStats({
      totalEvents: 0,
      ISREvents: 0,
      integratedLuminosity: 0,
    });
    setDisplayEvents([]);
    setActiveEvent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-6 flex flex-col gap-6">
      
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 bg-slate-950 sticky top-0 z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-500 tracking-tight">ZEUS Kinematic Explorer</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Probing Proton Structure with Initial State Radiation</p>
        </div>
        <div className="flex gap-3 items-center">
           <button 
            onClick={resetSimulation}
            className="p-2 hover:bg-slate-800 rounded text-slate-400 transition-colors"
            title="Reset Simulation"
          >
            <RefreshCw size={18} />
          </button>
          <div className={`px-3 py-1 rounded text-xs font-mono font-bold ${isRunning ? 'bg-green-900/50 text-green-400 border border-green-800 animate-pulse' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            {isRunning ? 'RUNNING' : 'PAUSED'}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Stats */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5 text-blue-400 border-b border-slate-800 pb-2">
              <Settings size={18} />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Beam Controls</h2>
            </div>

            <div className="space-y-6">
              
              {/* Beam Energy Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Gauge size={14} /> Proton Beam Configuration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBeamEnergy('ALL')}
                    className={`col-span-2 py-2 px-1 text-xs font-bold rounded border transition-all ${
                      beamEnergy === 'ALL' 
                        ? 'bg-slate-700 border-slate-500 text-white' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    MIXED MODE (ALL)
                    <div className="text-[9px] font-normal opacity-70">Run all energies simultaneously</div>
                  </button>

                  {(['HER', 'MER', 'LER'] as BeamEnergyType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBeamEnergy(type)}
                      className={`py-2 px-1 text-xs font-bold rounded border transition-all ${
                        beamEnergy === type 
                          ? type === 'HER' ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : type === 'MER' ? 'bg-green-500/20 border-green-500 text-green-400'
                          : 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      {type}
                      <div className="text-[9px] font-normal opacity-70">
                        {type === 'HER' ? '920' : type === 'MER' ? '575' : '460'} GeV
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ISR Toggle */}
              <div className="bg-slate-800/50 rounded p-3 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${enableISR ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                    <Zap size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Enable ISR</span>
                </div>
                <button 
                  onClick={() => setEnableISR(!enableISR)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${enableISR ? 'bg-yellow-600' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enableISR ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Main Action */}
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all shadow-lg transform active:scale-95 
                  ${isRunning 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20'
                  }`}
              >
                {isRunning ? <span className="flex items-center justify-center gap-2"><Pause size={16} /> Pause</span> : <span className="flex items-center justify-center gap-2"><Play size={16} /> Simulate</span>}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-blue-400 border-b border-slate-800 pb-2">
              <Info size={18} />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Statistics</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Events Displayed</span>
                <span className="font-mono text-slate-200">{displayEvents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Total Simulated</span>
                <span className="font-mono text-slate-400">{stats.totalEvents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">ISR Candidates</span>
                <span className="font-mono text-yellow-500">{stats.ISREvents.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* 1. Detector View (Primary Visual) */}
          <div className="h-80 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl relative">
             <DetectorVisualization activeEvent={activeEvent} />
          </div>

          {/* 2. Kinematic Plane Visualizer */}
          <KinematicPlane events={displayEvents} currentBeam={beamEnergy} />

          {/* Physics Explanation */}
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 text-sm text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Physics Insight:</strong> This display demonstrates how Initial State Radiation (ISR) extends the kinematic reach of HERA.
            <ul className="list-disc ml-5 mt-2 space-y-1 mb-4">
              <li>The <span className="text-blue-400 font-bold">HER (High Energy)</span> events are confined to the top-right region (y &lt; 1).</li>
              <li>Reducing beam energy (<span className="text-green-400 font-bold">MER</span>, <span className="text-red-400 font-bold">LER</span>) shifts the kinematic limit y=1 downwards.</li>
              <li><span className="text-yellow-500 font-bold">ISR Events</span> naturally have a reduced center-of-mass energy because the emitted photon carries away momentum. This allows them to populate the "forbidden" region below the standard HER limit, effectively probing lower Q² and lower x without changing the accelerator settings.</li>
            </ul>
            
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800/50">
              <BookOpen size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500">Reference:</span>
              <a 
                href="https://www.physics.mcgill.ca/xhep/en/resources/thesis/2011_Schwartz_PhD_Zeus_Fl.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Experimental Study of Initial State Radiative Events at HERA (Schwartz, 2011)
              </a>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;
