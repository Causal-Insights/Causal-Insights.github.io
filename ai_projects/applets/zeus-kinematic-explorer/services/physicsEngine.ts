
import { PhysicsEvent, BeamEnergyType, KinematicLimit } from '../types';

// --- Constants ---
const E_ELECTRON = 27.5; // GeV

// Run Configurations
const RUN_CONFIGS: Record<string, { Ep: number; color: string }> = {
  HER: { Ep: 920.0, color: '#3b82f6' }, // Blue
  MER: { Ep: 575.0, color: '#22c55e' }, // Green
  LER: { Ep: 460.0, color: '#ef4444' }  // Red
};

// --- Physics Model Class ---
class PhysicsModel {
  // Standard Dipole/PDF parameterization for event probability
  static getDifferentialXS(x: number, Q2: number, y: number): number {
    // d2sigma / dxdQ2 ~ (1/xQ^4) * (1 + (1-y)^2) * F2
    // Simplified F2 model ~ x^-0.2
    const propagator = 1.0 / (Math.pow(Q2, 2)); 
    const Yp = 1 + Math.pow(1 - y, 2);
    const F2 = 0.5 * Math.pow(x, -0.2); 
    return propagator * Yp * F2;
  }
}

// --- Helper: Calculate Kinematic Limit Line (y=1) ---
export const getKinematicLimit = (beamType: 'HER' | 'MER' | 'LER'): KinematicLimit[] => {
  const Ep = RUN_CONFIGS[beamType].Ep;
  const s = 4 * E_ELECTRON * Ep;
  
  // Q2 = s * x * y. Max Q2 happens at y=1 -> Q2 = s*x
  const points: KinematicLimit[] = [];
  const x_min = 1e-5;
  const x_max = 1;
  
  // Log steps
  for (let i = 0; i <= 20; i++) {
    const logX = Math.log10(x_min) + (i / 20) * (Math.log10(x_max) - Math.log10(x_min));
    const x = Math.pow(10, logX);
    const Q2 = s * x;
    points.push({ x, Q2 });
  }
  return points;
};

// --- Event Generation ---
export const generateEvent = (id: number, selectedMode: BeamEnergyType, allowISR: boolean): PhysicsEvent => {
  
  // Determine actual beam energy for this specific event
  let actualBeam: 'HER' | 'MER' | 'LER';
  if (selectedMode === 'ALL') {
    const rand = Math.random();
    if (rand < 0.33) actualBeam = 'HER';
    else if (rand < 0.66) actualBeam = 'MER';
    else actualBeam = 'LER';
  } else {
    actualBeam = selectedMode;
  }

  const Ep = RUN_CONFIGS[actualBeam].Ep;
  const s_nominal = 4 * E_ELECTRON * Ep;
  
  // Phase space limits for Generation
  const minQ2 = 1.0; const maxQ2 = 40000.0;
  const minX = 1e-5; const maxX = 0.8;

  let valid = false;
  let evt: Partial<PhysicsEvent> = {};

  // Safety break
  let attempts = 0;

  while (!valid && attempts < 100) {
    attempts++;
    
    // Randomly sample phase space (Log uniform for better visualization coverage)
    const Q2 = Math.exp(Math.random() * (Math.log(maxQ2) - Math.log(minQ2)) + Math.log(minQ2));
    const x = Math.exp(Math.random() * (Math.log(maxX) - Math.log(minX)) + Math.log(minX));
    
    let s_effective = s_nominal;
    let isISR = false;
    let E_gamma = 0;
    let detected = true;

    // Determine if this is an ISR event
    // ISR effectively lowers the center of mass energy
    if (allowISR && Math.random() < 0.25) { 
      isISR = true;
      // Generate Photon Energy spectrum 
      const z = Math.random(); 
      E_gamma = z * (E_ELECTRON - 2.0); // Photon takes some electron energy
      
      // The hard interaction happens at reduced energy
      s_effective = 4 * (E_ELECTRON - E_gamma) * Ep;
    }

    // Calculate Inelasticity y = Q2 / (s * x) using the EFFECTIVE s
    const y = Q2 / (s_effective * x);

    // Physical cuts
    if (y > 0.005 && y < 0.95) {
      const xs = PhysicsModel.getDifferentialXS(x, Q2, y);
      
      // Flattening weight for MC sampling
      const weight = xs * Math.pow(Q2, 2); 
      
      // Accept/Reject to shape the distribution
      if (Math.random() < weight) {
        valid = true;
        evt = { 
          id, 
          beamEnergy: actualBeam, 
          isISR, 
          Q2, 
          x, 
          y, 
          s: s_effective, 
          E_gamma, 
          detected, 
          timestamp: Date.now() 
        };
      }
    }
  }
  return evt as PhysicsEvent;
};
