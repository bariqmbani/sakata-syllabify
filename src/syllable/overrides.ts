export type VerifiedOverride = {
  parts: string[];
  reason: string;
};

export const VERIFIED_OVERRIDES: Record<string, VerifiedOverride> = {
  iduladha: {
    parts: ['idulad', 'ha'],
    reason: 'Legacy gameplay split for a fixed religious-holiday term.',
  },
  menggei: {
    parts: ['meng', 'gei'],
    reason: 'Legacy gameplay split for final -gei handling.',
  },
  menggwei: {
    parts: ['meng', 'gwei'],
    reason: 'Legacy gameplay split for final -gwei handling.',
  },
  bau: {
    parts: ['ba', 'u'],
    reason: "Gameplay-specific split; avoids treating 'au' as final diphthong.",
  },
};
