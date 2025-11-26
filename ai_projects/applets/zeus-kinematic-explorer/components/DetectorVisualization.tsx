
import React, { useEffect, useState } from 'react';
import { ParticleType, BeamEnergyType } from '../types';

interface Props {
  activeEvent: { 
    type: ParticleType; 
    angle: number; 
    hasPhoton: boolean; 
    photonAngle: number; 
    photonDetected: boolean;
    beamEnergy: string;
  } | null;
}

const DetectorVisualization: React.FC<Props> = ({ activeEvent }) => {
  const [particles, setParticles] = useState<{ id: number; type: ParticleType; x: number; y: number; dx: number; dy: number; undetected?: boolean }[]>([]);

  useEffect(() => {
    if (activeEvent) {
      const newParticles = [];
      
      // Scattered Electron (Upper/Lower Hemisphere based on angle)
      const angleRad = (activeEvent.angle * Math.PI) / 180;
      newParticles.push({
        id: Date.now(),
        type: ParticleType.ELECTRON,
        x: 300, // Shifted Interaction point X (more space for rear)
        y: 200, // Interaction point Y
        dx: Math.cos(angleRad) * 12,
        dy: Math.sin(angleRad) * 12,
      });

      // Hadronic Jet (Opposite direction + forward boost)
      // HER events are more boosted forward (right) than LER
      const boostFactor = activeEvent.beamEnergy === 'HER' ? 4 : activeEvent.beamEnergy === 'MER' ? 3 : 2;
      
      newParticles.push({
        id: Date.now() + 1,
        type: ParticleType.HADRON,
        x: 300,
        y: 200,
        dx: -Math.cos(angleRad) * 8 + boostFactor, 
        dy: -Math.sin(angleRad) * 8,
      });

      // ISR Photon (Goes rear/backwards towards PCAL)
      if (activeEvent.hasPhoton) {
        // Visual exaggeration: ISR photons go left
        const visAngle = activeEvent.photonDetected ? 0 : (Math.random() > 0.5 ? 0.1 : -0.1); 
        
        newParticles.push({
          id: Date.now() + 2,
          type: ParticleType.PHOTON,
          x: 300,
          y: 200,
          dx: -15 * Math.cos(visAngle), 
          dy: 15 * Math.sin(visAngle),
          undetected: !activeEvent.photonDetected
        });
      }

      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [activeEvent]);

  // Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({ ...p, x: p.x + p.dx, y: p.y + p.dy }))
          .filter(p => p.x > -100 && p.x < 900 && p.y > -100 && p.y < 500) // Keep within bounds
      );
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono bg-slate-900/80 p-2 rounded border border-slate-800">
        <div className="text-xs text-slate-400">ZEUS DETECTOR DISPLAY</div>
        {activeEvent && (
          <div className={`text-lg font-bold ${
            activeEvent.beamEnergy === 'HER' ? 'text-blue-400' : 
            activeEvent.beamEnergy === 'MER' ? 'text-green-400' : 'text-red-400'
          }`}>
            RUN: {activeEvent.beamEnergy} {activeEvent.hasPhoton && <span className="text-yellow-400 ml-2 animate-pulse">+ ISR PHOTON</span>}
          </div>
        )}
      </div>
      
      <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="gridBig" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridBig)" />

        {/* Beam Pipe */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="#475569" strokeWidth="2" strokeDasharray="10,5" />
        <text x="750" y="180" fill="#475569" fontSize="12" fontWeight="bold">Proton</text>
        <text x="50" y="180" fill="#475569" fontSize="12" fontWeight="bold">Electron</text>

        {/* ZEUS Central Detector */}
        <g transform="translate(260, 100)">
          {/* Outer CAL */}
          <rect x="0" y="0" width="80" height="200" fill="none" stroke="#334155" strokeWidth="4" />
          <rect x="5" y="5" width="70" height="190" fill="rgba(59, 130, 246, 0.05)" />
          
          {/* Inner Tracking */}
          <rect x="20" y="40" width="40" height="120" fill="none" stroke="#475569" strokeWidth="2" rx="10" />
          
          <text x="40" y="-10" fill="#3b82f6" fontSize="12" textAnchor="middle">Central Detector</text>
        </g>

        {/* Interaction Point */}
        <circle cx="300" cy="200" r="4" fill="#ffffff" />

        {/* Luminosity System (Far Rear) */}
        <g transform="translate(20, 160)">
          <rect x="0" y="0" width="20" height="80" fill="#eab308" stroke="#a16207" strokeWidth="2" />
          <text x="10" y="-10" fill="#eab308" fontSize="12" fontWeight="bold" textAnchor="middle">PCAL</text>
          <text x="10" y="95" fill="#713f12" fontSize="10" textAnchor="middle">Lumi Monitor</text>
        </g>

        {/* Particles */}
        {particles.map(p => (
          <g key={p.id}>
            {/* Trail */}
            <line 
              x1={p.x - p.dx * 3} y1={p.y - p.dy * 3} 
              x2={p.x} y2={p.y} 
              stroke={
                p.type === ParticleType.ELECTRON ? '#ef4444' : 
                p.type === ParticleType.HADRON ? '#22c55e' : 
                p.undetected ? '#94a3b8' : '#eab308' 
              }
              strokeWidth="2"
              opacity="0.5"
            />
            {/* Particle Head */}
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={p.type === ParticleType.PHOTON ? 6 : 3} 
              fill={
                p.type === ParticleType.ELECTRON ? '#ef4444' : 
                p.type === ParticleType.HADRON ? '#22c55e' : 
                p.undetected ? '#94a3b8' : '#eab308' 
              }
              stroke="#fff"
              strokeWidth="1"
              className={p.type === ParticleType.PHOTON && !p.undetected ? "animate-pulse" : ""}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default DetectorVisualization;
