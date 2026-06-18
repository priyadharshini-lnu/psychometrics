const COPY_PROTECTED_CLASS = 'assessment-copy-protected'
const PRINT_PROTECTION_CLASS = 'assessment-print-protection-active'
const PROTECTION_STYLE_ID = 'assessment-content-protection'

const EDITABLE_TARGET_SELECTOR = 'input, textarea, [contenteditable="true"], [data-allow-content-copy="1"]'

const PROTECTION_CSS = `
[data-content-protected] {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

[data-content-protected] input,
[data-content-protected] textarea,
[data-content-protected] [contenteditable="true"],
[data-content-protected] [data-allow-content-copy="1"] {
  user-select: text;
  -webkit-user-select: text;
  -webkit-touch-callout: default;
}

body.${PRINT_PROTECTION_CLASS} * {
  visibility: hidden !important;
}

@media print {
  body.${COPY_PROTECTED_CLASS} * {
    visibility: hidden !important;
  }
}
`

let printBlockingCount = 0

const isShortcutPressed = (event: KeyboardEvent, key: string, code: string) => {
  if (!event.ctrlKey && !event.metaKey) return false

  return event.key?.toLowerCase() === key || event.code === code
}

const isPrintShortcut = (event: KeyboardEvent) => isShortcutPressed(event, 'p', 'KeyP')
const isSaveShortcut = (event: KeyboardEvent) => isShortcutPressed(event, 's', 'KeyS')

const blockPrintShortcut = (event: KeyboardEvent) => {
  if (!isPrintShortcut(event)) return

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
}

const onBeforePrint = () => {
  document.body.classList.add(PRINT_PROTECTION_CLASS)
}

const onAfterPrint = () => {
  document.body.classList.remove(PRINT_PROTECTION_CLASS)
}

export const enablePrintBlocking = () => {
  printBlockingCount += 1
  if (printBlockingCount > 1) return

  window.addEventListener('keydown', blockPrintShortcut, true)
  document.addEventListener('keydown', blockPrintShortcut, true)
  window.addEventListener('beforeprint', onBeforePrint)
  window.addEventListener('afterprint', onAfterPrint)
  document.body.classList.add(COPY_PROTECTED_CLASS)

  if (!document.getElementById(PROTECTION_STYLE_ID)) {
    const style = document.createElement('style')
    style.id = PROTECTION_STYLE_ID
    style.textContent = PROTECTION_CSS
    document.head.appendChild(style)
  }
}

export const disablePrintBlocking = () => {
  if (printBlockingCount === 0) return
  printBlockingCount -= 1
  if (printBlockingCount > 0) return

  window.removeEventListener('keydown', blockPrintShortcut, true)
  document.removeEventListener('keydown', blockPrintShortcut, true)
  window.removeEventListener('beforeprint', onBeforePrint)
  window.removeEventListener('afterprint', onAfterPrint)
  document.body.classList.remove(COPY_PROTECTED_CLASS)
  document.body.classList.remove(PRINT_PROTECTION_CLASS)
  document.getElementById(PROTECTION_STYLE_ID)?.remove()
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(EDITABLE_TARGET_SELECTOR))
}

const toElement = (node: Node | null) => (node instanceof Element ? node : node?.parentElement)

export const protectContent = (getContainer: () => HTMLElement | null) => {
  const shouldProtectEventTarget = (target: EventTarget | null) => {
    const container = getContainer()
    if (!container || !(target instanceof Element)) return false
    if (!container.contains(target)) return false

    return !isEditableTarget(target)
  }

  const blockEvent = (event: Event) => {
    if (!shouldProtectEventTarget(event.target)) return

    event.preventDefault()
    event.stopPropagation()
  }

  const clearProtectedSelection = () => {
    const container = getContainer()
    const selection = window.getSelection()
    if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) return

    const selectionElements = [toElement(selection.anchorNode), toElement(selection.focusNode)]
      .filter((element): element is Element => Boolean(element))
    const insideProtectedContent = selectionElements.some(element => container.contains(element))
    const insideEditableContent = selectionElements.some(element => isEditableTarget(element))

    if (insideProtectedContent && !insideEditableContent) {
      selection.removeAllRanges()
    }
  }

  const blockSelectionShortcut = (event: KeyboardEvent) => {
    const key = event.key?.toLowerCase()
    const modifierPressed = event.ctrlKey || event.metaKey
    if (!modifierPressed || !['a', 'c', 's'].includes(key)) return
    if (!shouldProtectEventTarget(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    window.getSelection()?.removeAllRanges()
  }

  document.addEventListener('copy', blockEvent, true)
  document.addEventListener('cut', blockEvent, true)
  document.addEventListener('contextmenu', blockEvent, true)
  document.addEventListener('selectstart', blockEvent, true)
  document.addEventListener('mousedown', blockEvent, true)
  document.addEventListener('selectionchange', clearProtectedSelection)
  document.addEventListener('keydown', blockSelectionShortcut, true)
  enablePrintBlocking()

  return () => {
    document.removeEventListener('copy', blockEvent, true)
    document.removeEventListener('cut', blockEvent, true)
    document.removeEventListener('contextmenu', blockEvent, true)
    document.removeEventListener('selectstart', blockEvent, true)
    document.removeEventListener('mousedown', blockEvent, true)
    document.removeEventListener('selectionchange', clearProtectedSelection)
    document.removeEventListener('keydown', blockSelectionShortcut, true)
    disablePrintBlocking()
  }
}

export const protectPageInteractions = () => {
  const blockContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }

  const blockSaveShortcut = (event: KeyboardEvent) => {
    if (!isSaveShortcut(event)) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }

  document.addEventListener('contextmenu', blockContextMenu, true)
  document.addEventListener('keydown', blockSaveShortcut, true)

  return () => {
    document.removeEventListener('contextmenu', blockContextMenu, true)
    document.removeEventListener('keydown', blockSaveShortcut, true)
  }
}
