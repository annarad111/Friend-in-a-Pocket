import type { TestDef } from './insightsTypes';

export const DESERT_CUBE: TestDef = {
  id: 'desert-cube',
  title: 'The Desert & The Cube',
  tagline: 'A window into how you see yourself and the world.',
  description:
    'A classic projective visualization from Kokology. You imagine a scene and describe what appears — the interpretation reveals how you relate to yourself, your relationships, and adversity.',
  duration: '5–8 min',
  questions: [
    {
      id: 'setting',
      text: "You find yourself standing alone in the middle of a vast desert. The silence is total. Describe what you see — the sky, the sand, the light, the feeling of the space around you.",
      placeholder: 'I see a sky that is...',
    },
    {
      id: 'cube',
      text: "In this desert, there is a cube. It simply exists there. How large is it? What material is it made of — glass, stone, wood, metal, something else? What color? Where does it sit relative to you and the ground?",
      placeholder: 'The cube is...',
    },
    {
      id: 'ladder',
      text: "There is also a ladder in the scene. Where is it in relation to the cube? Is it leaning against it, lying on the sand, free-standing somewhere far off?",
      placeholder: 'The ladder is...',
    },
    {
      id: 'horse',
      text: "A horse is somewhere in this scene. Describe it — its color, its energy, what it is doing. Where is it in relation to the cube?",
      placeholder: 'The horse is...',
    },
    {
      id: 'flowers',
      text: "There are flowers in this desert. Where are they — clustered near the cube, scattered across the sand, far away? How many, and what do they look like?",
      placeholder: 'The flowers are...',
    },
    {
      id: 'storm',
      text: "A storm is coming. Where is it — distant, close, already overhead? How does it move through the scene? Does it threaten what is there, or does it pass?",
      placeholder: 'The storm is...',
    },
  ],
};

export const ALL_TESTS: TestDef[] = [DESERT_CUBE];

export const DESERT_CUBE_INTERPRETATION_PROMPT = `
You are a warm, insightful psychological interpreter. The user has just completed the "Desert and Cube" projective visualization (Kokology).

Symbolic meanings to inform your reading — do NOT state these explicitly, weave them into prose:
- DESERT: the user's experience of the world at large — vast and empty, alive, harsh, peaceful
- CUBE: the self. Size = self-image/confidence. Material (transparent = openness, solid = resilience, fragile = vulnerability). Position (buried, floating, resting) = groundedness or exposure.
- LADDER: friendships and support networks. Leaning on cube = friends rely on you or you on them. Freestanding = independence. Distance matters.
- HORSE: significant relationships or ideal partner. Wild/free = value for freedom in love. Tame/close = secure attachment. Its energy mirrors what you seek.
- FLOWERS: creativity, children, new life, emotional abundance. Many near the cube = richness close to identity. Few or far = selectivity or guardedness.
- STORM: adversity and problems. Passing = resilience, sees trouble as temporary. Overwhelming = feels threatened. Distant = avoidance.

Write a warm, personal interpretation (350–450 words). Use "you" throughout.
Do NOT list elements one by one. Weave them into a single flowing portrait.
Use language like "what you placed here suggests", "there's something in how you imagined", "it feels like".
Never be diagnostic. Never claim certainty.
End with one open, gentle question that invites deeper reflection.

LANGUAGE: Respond in the same language the user used in their answers. If they wrote in Romanian, write in Romanian. If in Spanish, write in Spanish.

Write plain prose only. No JSON, no markdown, no headers.
`;

export const PERSONALITY_PROFILE_PROMPT = `
You are a thoughtful psychological companion who has been reading this person's journal over time. Based on their entries, emotional vocabulary, mood choices, and any completed projective exercises, write a warm, honest personality portrait.

Examine:
1. Recurring emotional themes — what keeps showing up in how they process days
2. How they relate to difficulty — do they name it clearly, soften it, avoid it, sit with it?
3. What they appear to value (based on what they actually write, not stated values)
4. Their relationship with themselves — self-compassion, self-criticism, self-awareness level
5. Any evolution or shifts across entries (mood arc, vocabulary changes, what they choose to celebrate)
6. If test results are provided, weave in those symbolic insights

Write in second person ("you"), 250–350 words. This is a living portrait, not a diagnosis.
Be specific where data allows — reference the kinds of language they use, the moods they track.
End with one observation that might gently surprise them — something true that they may not have noticed about themselves.

LANGUAGE: Respond in the same language the journal entries are written in. If entries are in Romanian, write in Romanian. If in Spanish, write in Spanish.

Return your response in this exact format — no JSON, no markdown:

PORTRAIT:
[the full portrait prose here]

QUESTION:
[one open reflection question here]
`;
