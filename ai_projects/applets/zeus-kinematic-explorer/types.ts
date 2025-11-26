
export enum ParticleType {
  ELECTRON = 'ELECTRON',
  PROTON = 'PROTON',
  PHOTON = 'PHOTON',
  HADRON = 'HADRON'
}

export type BeamEnergyType = 'HER' | 'MER' | 'LER' | 'ALL';

export interface PhysicsEvent {
  id: number;
  beamEnergy: Exclude<BeamEnergyType, 'ALL'>; // Resolved energy for the specific event
  isISR: boolean;
  Q2: number;
  x: number;
  y: number;
  s: number; // Center of mass energy squared
  E_gamma: number;
  detected: boolean;
  timestamp: number;
}

export interface KinematicLimit {
  x: number;
  Q2: number;
}

export interface SimulationStats {
  totalEvents: number;
  ISREvents: number;
  integratedLuminosity: number; // pb^-1
}

export interface RosenbluthPoint {
  yTerm: number;
  reducedCrossSection: number;
  error: number;
}
