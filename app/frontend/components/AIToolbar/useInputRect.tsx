import { Rect } from './types'

export const useInputRect = () => {
  const getInputRect = (input: HTMLInputElement | HTMLTextAreaElement): Rect | null => {
    try {
      const { selectionStart, selectionEnd, value } = input
      if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') return null

      // Create mirror div
      const div = document.createElement('div')
      const inputRect = input.getBoundingClientRect()
      const computed = window.getComputedStyle(input)

      // Copy styles for exact layout matching
      const stylesToCopy = [
        'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth',
        'boxSizing', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant',
        'fontWeight', 'letterSpacing', 'lineHeight', 'paddingBottom', 'paddingLeft',
        'paddingRight', 'paddingTop', 'textAlign', 'textDecoration', 'textIndent',
        'textTransform', 'width', 'height',
      ]
      stylesToCopy.forEach(key => div.style.setProperty(key, computed.getPropertyValue(key)))

      // Handle Input vs Textarea whitespace
      const isInput = input.tagName === 'INPUT'
      div.style.position = 'absolute'
      div.style.visibility = 'hidden'
      div.style.whiteSpace = isInput ? 'pre' : 'pre-wrap'
      div.style.wordWrap = isInput ? 'normal' : 'break-word'
      div.style.overflow = 'hidden'

      // Fill content
      div.textContent = value.substring(0, selectionStart)

      const span = document.createElement('span')
      span.textContent = value.substring(selectionStart, selectionEnd) || '.'
      span.style.font = computed.font
      div.appendChild(span)
      document.body.appendChild(div)

      // Calculate coordinates
      const spanRect = span.getBoundingClientRect()
      const divRect = div.getBoundingClientRect()
      document.body.removeChild(div)

      const relativeTop = spanRect.top - divRect.top
      const relativeLeft = spanRect.left - divRect.left

      const top = inputRect.top + relativeTop + parseFloat(computed.borderTopWidth) - input.scrollTop
      const left = inputRect.left + relativeLeft + parseFloat(computed.borderLeftWidth) - input.scrollLeft

      // If it's a multi-line/full selection in a scrolling area, center it.
      // Otherwise, use the precise calculation for single lines.
      const hasScroll = input.scrollHeight > input.clientHeight
      const isMultiLineSelection = spanRect.height > (parseFloat(computed.lineHeight) || 24) * 1.5

      if (hasScroll && isMultiLineSelection) {
        const visibleTop = Math.max(inputRect.top, 0)
        const visibleBottom = Math.min(inputRect.bottom, window.innerHeight)
        return {
          top: (visibleTop + visibleBottom) / 2,
          left: inputRect.left + (inputRect.width / 2),
          width: 1,
          height: 20,
        }
      }

      if (top < inputRect.top || top > inputRect.bottom) return null

      return {
        top,
        left,
        width: spanRect.width || 1,
        height: spanRect.height,
      }
    } catch (e) {
      return null
    }
  }

  return { getInputRect }
}
