import type { RefineRequest } from "./types";

export function buildRefinePrompt(request: RefineRequest, fetchedPostText = ""): string {
  return `Refine an X reply using the user's signal settings and requested intent.

Direct X post link:
${request.xPostUrl || "(none provided)"}

Text found from the direct X link, if available:
${fetchedPostText || "(none found or not available)"}

Pasted post / context:
${request.postContext || "(none provided)"}

Screenshot:
${request.screenshotDataUrl ? "A screenshot was provided. Read it carefully and use it as the source of truth when visible." : "(none provided)"}

User's rough reply, if any:
${request.roughReply || "(none provided)"}

Desired intent:
${request.intent}

Signal mode:
${request.voiceMode}

User signal settings:
- Handle: ${request.profile.handle}
- Core signal: ${request.profile.coreTone}
- Signal breakers to avoid: ${request.profile.avoid}
- Signature signal words: ${request.profile.signaturePhrases}
- Preferred reply length: ${request.profile.preferredLength}
- Position on X: ${request.profile.personalStance}

Return five distinct options and the warning/score. Keep most reply options under 280 characters. Make every whyItWorks note specific, short, and useful. Calculate characterCount from the exact reply text.`;
}
