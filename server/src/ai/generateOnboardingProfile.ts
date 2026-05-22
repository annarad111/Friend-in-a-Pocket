import { ONBOARDING_PROFILE_PROMPT } from "./onboardingPrompt";
import { fixJsonControlChars } from "./fixJson";
import {
  OnboardingRequest,
  GeneratedOnboardingProfile,
} from "../types/onboarding";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODEL = "anthropic/claude-3-haiku";

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No valid JSON object found in model response.");
  }

  return fixJsonControlChars(text.slice(start, end + 1));
}

export async function generateOnboardingProfile(
  input: OnboardingRequest,
): Promise<GeneratedOnboardingProfile> {
  const userPrompt = `
Friend name: ${input.friendName}
Favorite animal: ${input.favoriteAnimal}
Favorite color: ${input.favoriteColor}
Favorite musical instrument: ${input.favoriteInstrument}
`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Friend in a Pocket",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: ONBOARDING_PROFILE_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.8,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`OpenRouter onboarding error [${response.status}]:`, text);
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();

  const rawText = data.choices?.[0]?.message?.content?.trim();
  console.log("RAW AI RESPONSE:", rawText);

  if (!rawText) {
    throw new Error("Empty onboarding profile response.");
  }

  const jsonText = extractJson(rawText);
  const parsed = JSON.parse(jsonText) as GeneratedOnboardingProfile;

  return parsed;
}
