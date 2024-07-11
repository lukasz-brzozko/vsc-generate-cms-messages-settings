import { MESSAGES, SETTINGS } from "./constants";
import { TSetting } from "./types";

export const getVariable = (text: string): string[] => {
  return text
    .trim()
    .split(",")
    .map((str) => str.trimStart().trimEnd())
    .filter(Boolean);
};

export const getKeyValue = (text: string): TSetting => {
  const [key, value = ""] = text
    .trim()
    .split(/[\=\:]/g)
    .map((str) => removeStringChars(str.trim()));

  return { key, value };
};

export const removeStringChars = (text: string): string => {
  const stringChars = ['"', "'", "`"];

  const hasStringChar = stringChars.some(
    (char) => text.startsWith(char) && text.endsWith(char)
  );

  if (!hasStringChar) {
    return text;
  }

  return text.slice(1, -1);
};

export const generateJson = (keyValues: TSetting[], target: string): string => {
  const payload = {
    messages: target === MESSAGES ? [...keyValues] : [],
    settings: target === SETTINGS ? [...keyValues] : [],
  };

  return JSON.stringify(payload);
};
