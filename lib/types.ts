export type IntentOption =
  | "Add signal"
  | "Disagree elegantly"
  | "Be funny"
  | "Ask a smart question"
  | "Sound premium"
  | "Be bold"
  | "Be warm"
  | "Make them curious";

export type VoiceMode =
  | "Dibbes default"
  | "Still + sly"
  | "Warm intelligence"
  | "High signal"
  | "Elegant disagreement"
  | "Viral but human";

export type VoiceProfile = {
  handle: string;
  coreTone: string;
  avoid: string;
  signaturePhrases: string;
  preferredLength: string;
  personalStance: string;
};

export type ReplyVariant = {
  text: string;
  whyItWorks: string;
  characterCount: number;
};

export type QualityScore = {
  score: number;
  reason: string;
  improvementTip: string;
};

export type RefineRequest = {
  postContext: string;
  xPostUrl: string;
  screenshotDataUrl: string;
  roughReply: string;
  intent: IntentOption | string;
  voiceMode: VoiceMode | string;
  profile: VoiceProfile;
};

export type RefineResult = {
  bestReply: ReplyVariant;
  sharperReply: ReplyVariant;
  warmerReply: ReplyVariant;
  bolderReply: ReplyVariant;
  quotePostAngle: ReplyVariant;
  qualityScore: QualityScore;
};

export type RefineApiResponse = Partial<RefineResult> & { error?: string };

export type HistoryItem = {
  id: string;
  createdAt: string;
  postContext: string;
  xPostUrl?: string;
  screenshotName?: string;
  roughReply: string;
  intent: string;
  voiceMode: string;
  result: RefineResult;
};
