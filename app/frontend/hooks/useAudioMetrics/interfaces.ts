export enum AudioLevel {
  Low = 'low',
  High = 'high',
}

export interface State {
  level: AudioLevel,
  pulse: number
}

export interface StateFunctions {
  setLevel: (level: AudioLevel) => void
  setPulse: (pulse: number) => void
  updatePulse: () => void
  resetMetrics: () => void
}
