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

export type ExecuteRequest = {
  signalType: SignalType | string;
  input: string;
  customInstruction?: string;
};

export type ExecuteResponse = {
  output: string;
  error?: string;
};

export type SavedResult = {
  id: string;
  signalType: SignalType | string;
  input: string;
  output: string;
  createdAt: string;
};
