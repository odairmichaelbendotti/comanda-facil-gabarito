import { z } from "zod";

// An empty input means "left blank" on every optional text field in this
// project — forms send "" rather than omitting the key, and storing empty
// strings as if they were real data would make every later read check for
// two kinds of absence (undefined and "") instead of one.
export function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value ? value : undefined));
}
