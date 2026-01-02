import { Rect } from './types'

export const useInputRect = () => {
  const getInputRect = (input: HTMLInputElement | HTMLTextAreaElement): Rect | null => {
    try {
      const { selectionStart, selectionEnd, value } = input
      if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') return null

      // Create mirror div
      const div = document.createElement('div')
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
      const inputRect = input.getBoundingClientRect()

      const relativeTop = spanRect.top - divRect.top
      const relativeLeft = spanRect.left - divRect.left

      document.body.removeChild(div)

      // Map to viewport with scroll offset
      const top = inputRect.top + relativeTop + parseFloat(computed.borderTopWidth) - input.scrollTop
      const left = inputRect.left + relativeLeft + parseFloat(computed.borderLeftWidth) - input.scrollLeft

      // Check if calculated position is outside visible input area
      const isOutsideVertical = top < inputRect.top || top > inputRect.bottom
      const isOutsideHorizontal = left < inputRect.left || left > inputRect.right

      // If selection is scrolled out of view, position toolbar near the visible input element
      if (isOutsideVertical || isOutsideHorizontal) {
        return {
          top: inputRect.top,
          left: inputRect.left,
          width: inputRect.width,
          height: Math.min(spanRect.height, inputRect.height),
        }
      }

      return {
        top,
        left,
        width: spanRect.width,
        height: spanRect.height,
      }
    } catch (e) {
      return null
    }
  }

  return { getInputRect }
}
