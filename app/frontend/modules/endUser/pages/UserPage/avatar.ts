import { createAvatar } from '@dicebear/core'
import { thumbs } from '@dicebear/collection'

// Deterministic DiceBear avatar for users without an uploaded photo — the same
// seed (email) always draws the same face, so the fallback feels owned.
export const fallbackAvatar = (seed: string): string => createAvatar(thumbs, { seed }).toDataUri()
