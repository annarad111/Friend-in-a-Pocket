export type GeneratedOnboardingProfile = {
  animalMeaning: string;
  colorMeaning: string;
  instrumentMeaning: string;
  personalityReflection: string;
  companionCompatibility: string;
};

export type StoredOnboardingProfile = {
  friendName: string;
  favoriteAnimal: string;
  favoriteColor: string;
  favoriteInstrument: string;
  generatedProfile: GeneratedOnboardingProfile | null;
};