/** GPT-2 here runs on short prompts so the diagram stays readable. */
export const WORD_LIMIT = 12;

/** Collapses runs of whitespace (including line breaks) into single spaces. */
export const normalisePrompt = (text: string): string => text.replace(/\s+/g, ' ');

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;
