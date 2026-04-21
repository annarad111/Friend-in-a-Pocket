import { GeneratedOnboardingProfile, UserOnboardingProfile } from '@/types/onboarding';

const API_BASE_URL ='http://localhost:8080';

export async function generateOnboardingProfile(
  profile: UserOnboardingProfile
): Promise<GeneratedOnboardingProfile> {
  const response = await fetch(`${API_BASE_URL}/api/onboarding-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Onboarding API error:', text);
    throw new Error('Could not generate onboarding profile.');
  }

  return response.json();
}