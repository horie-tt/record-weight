// src/types/index.ts
export interface MeasurementEntry {
  id: number;
  timestamp: string; // ISO string
  weight: number | null;
  bmi: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  visceralFat: number | null;
}
