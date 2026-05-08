export type SignalType =
  | "Portrait"
  | "Image Prompt"
  | "X Post"
  | "Meeting Notes"
  | "Rewrite"
  | "Summary"
  | "App Builder"
  | "Custom";

export type SignalDefinition = {
  type: SignalType;
  eyebrow: string;
  description: string;
  placeholder: string;
};

export type PortraitPreset =
  | "App Founder"
  | "AI Product Face"
  | "Premium Personal Brand"
  | "Warm Commercial"
  | "Dark Cinematic"
  | "Minimal Luxury";

export type ExecuteRequest = {
  signalType: SignalType | string;
  input: string;
  customInstruction?: string;
  generateImage?: boolean;
  portraitPreset?: PortraitPreset | string;
};

export type ExecutionKind = "text" | "image";

export type ExecutionResult = {
  kind: ExecutionKind;
  signalType: SignalType | string;
  output: string;
  title?: string;
  promptUsed?: string;
  rationale?: string;
  imageDataUrl?: string;
  imageError?: string;
  imageStored?: boolean;
};

export type ExecuteResponse = {
  output: string;
  result?: ExecutionResult;
  error?: string;
};

export type SavedResult = ExecutionResult & {
  id: string;
  input: string;
  createdAt: string;
  preview: string;
};
