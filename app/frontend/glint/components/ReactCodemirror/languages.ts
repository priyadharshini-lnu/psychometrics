import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { lua } from '@codemirror/legacy-modes/mode/lua'
import { linter, type LintSource } from '@codemirror/lint'
import { type Extension } from '@codemirror/state'

type EditorMode = 'lua' | 'javascript' | 'json'

export function getLanguageExtension (
  mode: EditorMode,
): LanguageSupport | StreamLanguage<unknown> | null {
  switch (mode) {
    case 'json':
      return json()
    case 'javascript':
      return javascript()
    case 'lua':
      return StreamLanguage.define(lua)
    default:
      return null
  }
}

export function getLinterExtension (mode: EditorMode): Extension | null {
  switch (mode) {
    case 'json':
      return linter(jsonParseLinter() as LintSource)
    default:
      return null
  }
}
