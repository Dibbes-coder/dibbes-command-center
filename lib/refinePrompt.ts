import type { RefineRequest } from "./types";

export function buildRefinePrompt(request: RefineRequest): string {
  return `Refine an X reply using the user's profile and requested intent.

X post / context:
${request.postContext}

User's rough reply, if any:
${request.roughReply || "(none provided)"}

Desired intent:
${request.intent}

Voice mode:
${request.voiceMode}

User profile / voice memory:
- Handle: ${request.profile.handle}
- Core tone: ${request.profile.coreTone}
- Things to avoid: ${request.profile.avoid}
- Signature phrases: ${request.profile.signaturePhrases}
- Preferred reply length: ${request.profile.preferredLength}
- Personal stance: ${request.profile.personalStance}

Return five distinct options and the warning/score. Keep most reply options under 280 characters. Make every whyItWorks note specific, short, and useful. Calculate characterCount from the exact reply text.`;
}
