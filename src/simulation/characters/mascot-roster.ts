export const MASCOT_IDS = ['dnake', 'zkteco', 'c3plus'] as const;
export type MascotId = (typeof MASCOT_IDS)[number];
export const MASCOT_NAMES: Record<MascotId, string> = {
  dnake: 'Dnake',
  zkteco: 'C2-260',
  c3plus: 'C3 Plus',
};
