import { GoogleGenAI } from '@google/genai';
import { ONBOARDING_PROFILE_PROMPT } from './onboardingPrompt';
import { OnboardingRequest, GeneratedOnboardingProfile } from '../types/onboarding';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = 'gemini-2.5-flash-lite';

function extractJson(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No valid JSON object found in model response.');
  }

  return text.slice(start, end + 1);
}

export async function generateOnboardingProfile(
  input: OnboardingRequest
): Promise<GeneratedOnboardingProfile> {
  const prompt = `
Friend name: ${input.friendName}
Favorite animal: ${input.favoriteAnimal}
Favorite color: ${input.favoriteColor}
Favorite musical instrument: ${input.favoriteInstrument}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: ONBOARDING_PROFILE_PROMPT,
      temperature: 0.8,
      maxOutputTokens: 800,
    },
  });

  const rawText = response.text?.trim();
  console.log(rawText);

  if (!rawText) {
    throw new Error('Empty onboarding profile response from model.');
  }

  const jsonText = extractJson(rawText);
  const parsed = JSON.parse(jsonText) as GeneratedOnboardingProfile;

  return parsed;
}