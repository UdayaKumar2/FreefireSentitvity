export default function getSensitivitySettings(baseSensitivity: number): number {
  const min = baseSensitivity;
  const max = Math.min(baseSensitivity + 5, 200);

  const adjustedSensitivity = Math.round(Math.random() * (max - min) + min);

  return adjustedSensitivity;
  
}
