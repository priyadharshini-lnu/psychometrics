import { EditorState } from '@codemirror/state'
import {
  EditorView, keymap, lineNumbers, highlightActiveLine,
} from '@codemirror/view'
import { defaultKeymap, indentWithTab, history } from '@codemirror/commands'
import { html } from '@codemirror/lang-html'
import { foldGutter, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'

type EventCallback = () => void

interface CM5Options {
  lineNumbers?: boolean
  lineWrapping?: boolean
  indentWithTabs?: boolean
  tabSize?: number
  mode?: string
  tabMode?: string
  readOnly?: boolean
}

interface SelectionPosition {
  line: number
  ch: number
}

class CodeMirrorAdapter {
  private view: EditorView

  private textarea: HTMLTextAreaElement

  private wrapper: HTMLDivElement

  private eventListeners: Map<string, EventCallback[]> = new Map()

  constructor (textarea: HTMLTextAreaElement, options: CM5Options = {}) {
    this.textarea = textarea

    this.wrapper = document.createElement('div')
    this.wrapper.className = 'CodeMirror'
    textarea.parentNode?.insertBefore(this.wrapper, textarea)
    textarea.style.display = 'none'

    const extensions = this.buildExtensions(options)
    const state = EditorState.create({
      doc: textarea.value,
      extensions,
    })

    this.view = new EditorView({
      state,
      parent: this.wrapper,
    })
  }

  private buildExtensions (options: CM5Options) {
    const extensions = [
      history(),
      keymap.of([...defaultKeymap, indentWithTab]),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          this.emitEvent('change')
        }
      }),
      EditorView.domEventHandlers({
        blur: () => { this.emitEvent('blur') },
        focus: () => { this.emitEvent('focus') },
      }),
    ]

    if (options.lineNumbers !== false) {
      extensions.push(lineNumbers())
    }

    if (options.lineWrapping) {
      extensions.push(EditorView.lineWrapping)
    }

    if (options.tabSize) {
      extensions.push(EditorState.tabSize.of(options.tabSize))
    }

    if (options.readOnly) {
      extensions.push(EditorState.readOnly.of(true))
    }

    if (options.mode === 'text/html') {
      extensions.push(html())
    }

    extensions.push(foldGutter())

    return extensions
  }

  private emitEvent (eventName: string) {
    const listeners = this.eventListeners.get(eventName) || []
    listeners.forEach(cb => cb())
  }

  getValue (): string {
    return this.view.state.doc.toString()
  }

  setValue (value: string) {
    this.view.dispatch({
      changes: { from: 0, to: this.view.state.doc.length, insert: value },
    })
  }

  setSize (_width: string | null, height: string | null) {
    if (height) {
      this.wrapper.style.height = height
      this.view.dom.style.height = '100%'
    }
  }

  setSelection (from: SelectionPosition, to: SelectionPosition) {
    const fromOffset = this.positionToOffset(from)
    const toOffset = this.positionToOffset(to)
    this.view.dispatch({
      selection: { anchor: fromOffset, head: toOffset },
    })
  }

  private positionToOffset (pos: SelectionPosition): number {
    const { doc } = this.view.state
    const lineCount = doc.lines
    const line = Math.min(pos.line + 1, lineCount)
    const lineInfo = doc.line(line)
    const ch = Math.min(pos.ch, lineInfo.length)
    return lineInfo.from + ch
  }

  setOption (name: string) {
    if (name === 'readOnly') {
      this.view.dispatch({
        effects: this.view.state.update({}).state.update({}).effects,
      })
    }
  }

  refresh () {
    this.view.requestMeasure()
  }

  focus () {
    this.view.focus()
  }

  clearHistory () {
    // CM6 history is managed via transactions; resetting requires
    // recreating state which is unnecessary for Froala's use case.
  }

  on (event: string, callback: EventCallback) {
    const existing = this.eventListeners.get(event) || []
    existing.push(callback)
    this.eventListeners.set(event, existing)
  }

  toTextArea () {
    this.textarea.value = this.getValue()
    this.textarea.style.display = ''
    this.view.destroy()
    this.wrapper.remove()
  }
}

const CodeMirrorCompat = {
  fromTextArea (textarea: HTMLTextAreaElement, options?: CM5Options): CodeMirrorAdapter {
    return new CodeMirrorAdapter(textarea, options)
  },
}

export default CodeMirrorCompat
