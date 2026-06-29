const COPY_PROTECTED_CLASS = 'assessment-copy-protected'
const PRINT_PROTECTION_CLASS = 'assessment-print-protection-active'
const PROTECTION_STYLE_ID = 'assessment-content-protection'
const CONTENT_PROTECTION_FEATURE = 'assessment_content_protection_enabled'

const LEGACY_EDITABLE_TARGET_SELECTOR = [
  'input',
  'textarea',
  '[contenteditable="true"]',
  '[data-allow-content-copy="1"]',
].join(', ')

const ENHANCED_EDITABLE_TARGET_SELECTOR = [
  ...LEGACY_EDITABLE_TARGET_SELECTOR.split(', '),
  '[role="slider"]',
  'input[type="range"]',
  '[data-interactive="true"]',
].join(', ')

const PASTE_BLOCK_TARGET_SELECTOR = 'input, textarea, [contenteditable="true"]'
const COPY_ALLOWED_TARGET_SELECTOR = '[data-allow-content-copy="1"]'

const isContentProtectionEnabled = () => (
  window.PsyGlobalState?.features?.[CONTENT_PROTECTION_FEATURE] === true
)

const getEditableTargetSelector = () => (
  isContentProtectionEnabled() ? ENHANCED_EDITABLE_TARGET_SELECTOR : LEGACY_EDITABLE_TARGET_SELECTOR
)

const buildProtectionCss = () => {
  const editableTargets = getEditableTargetSelector()
    .split(', ')
    .map(selector => `[data-content-protected] ${selector}`)
    .join(',\n')

  return `
[data-content-protected] {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

${editableTargets} {
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
}

let printBlockingCount = 0

const isShortcutPressed = (event: KeyboardEvent, key: string, code: string) => {
  if (!event.ctrlKey && !event.metaKey) return false

  return event.key?.toLowerCase() === key || event.code === code
}

const isPrintShortcut = (event: KeyboardEvent) => isShortcutPressed(event, 'p', 'KeyP')
const isSaveShortcut = (event: KeyboardEvent) => isShortcutPressed(event, 's', 'KeyS')
const isSelectAllShortcut = (event: KeyboardEvent) => isShortcutPressed(event, 'a', 'KeyA')

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
    style.textContent = buildProtectionCss()
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

const toTargetElement = (target: EventTarget | null) => {
  if (target instanceof Element) return target
  if (target instanceof Node) return target.parentElement

  return null
}

const isEditableTarget = (target: EventTarget | null) => {
  const targetElement = toTargetElement(target)
  if (!targetElement) return false

  return Boolean(targetElement.closest(getEditableTargetSelector()))
}

const toElement = (node: Node | null) => (node instanceof Element ? node : node?.parentElement)

export const protectContent = (getContainer: () => HTMLElement | null) => {
  if (!isContentProtectionEnabled()) {
    return () => {}
  }

  const shouldProtectEventTarget = (target: EventTarget | null) => {
    const container = getContainer()
    const targetElement = toTargetElement(target)

    if (!container || !targetElement) return false
    if (!container.contains(targetElement)) return false

    return !isEditableTarget(targetElement)
  }

  const shouldBlockPasteTarget = (target: EventTarget | null) => {
    const container = getContainer()
    const targetElement = toTargetElement(target)

    if (!container || !targetElement) return false
    if (!container.contains(targetElement)) return false

    return Boolean(targetElement.closest(PASTE_BLOCK_TARGET_SELECTOR))
  }

  const blockEvent = (event: Event) => {
    if (!shouldProtectEventTarget(event.target)) return

    event.preventDefault()
    event.stopPropagation()
  }

  const selectionIntersectsProtectedContent = () => {
    const container = getContainer()
    const selection = window.getSelection()

    if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) return false

    for (let index = 0; index < selection.rangeCount; index += 1) {
      if (selection.getRangeAt(index).intersectsNode(container)) return true
    }

    return false
  }

  const isCopyAllowedTarget = (target: EventTarget | null) => {
    const targetElement = toTargetElement(target)

    return Boolean(targetElement?.closest(COPY_ALLOWED_TARGET_SELECTOR))
  }

  const isInsideProtectedContainer = (target: EventTarget | null) => {
    const container = getContainer()
    const targetElement = toTargetElement(target)

    return Boolean(container && targetElement && container.contains(targetElement))
  }

  const blockClipboardEvent = (event: ClipboardEvent) => {
    if (isCopyAllowedTarget(event.target)) return
    if (!isInsideProtectedContainer(event.target) && !selectionIntersectsProtectedContent()) return

    event.preventDefault()
    event.stopImmediatePropagation()
  }

  const blockPasteEvent = (event: ClipboardEvent) => {
    if (!shouldBlockPasteTarget(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
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
    if (!isSelectAllShortcut(event)) return
    if (!shouldProtectEventTarget(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }

  document.addEventListener('copy', blockClipboardEvent, true)
  document.addEventListener('cut', blockClipboardEvent, true)
  document.addEventListener('paste', blockPasteEvent, true)
  document.addEventListener('contextmenu', blockEvent, true)
  document.addEventListener('selectstart', blockEvent, true)
  document.addEventListener('selectionchange', clearProtectedSelection)
  document.addEventListener('keydown', blockSelectionShortcut, true)
  enablePrintBlocking()

  return () => {
    document.removeEventListener('copy', blockClipboardEvent, true)
    document.removeEventListener('cut', blockClipboardEvent, true)
    document.removeEventListener('paste', blockPasteEvent, true)
    document.removeEventListener('contextmenu', blockEvent, true)
    document.removeEventListener('selectstart', blockEvent, true)
    document.removeEventListener('selectionchange', clearProtectedSelection)
    document.removeEventListener('keydown', blockSelectionShortcut, true)
    disablePrintBlocking()
  }
}

export const protectPageInteractions = () => {
  if (!isContentProtectionEnabled()) {
    return () => {}
  }

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
