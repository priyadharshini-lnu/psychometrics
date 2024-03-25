export function characterAndWordLimit (validation) {
  let maxWordLimit; let
    maxCharacterLimit
  if (validation.type === 'MaxLength' || validation.type === 'CharacterRange') {
    maxCharacterLimit = validation.args?.maxLength
  } else if (validation.type === 'MaxWords' || validation.type === 'WordsRange') {
    maxWordLimit = validation.args?.maxLength
  }
  return { maxWordLimit, maxCharacterLimit }
}
