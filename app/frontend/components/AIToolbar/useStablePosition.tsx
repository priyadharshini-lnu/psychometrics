import {
  useRef, useEffect, useCallback,
} from 'react'

export const useStablePosition = (
  container: HTMLElement | null,
  withSpellchecker = false,
) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)

  const updateButtonVisibility = useCallback((visible: boolean) => {
    if (buttonRef.current) {
      buttonRef.current.style.opacity = visible ? '1' : '0'
      buttonRef.current.style.pointerEvents = visible ? 'auto' : 'none'
    }
  }, [])

  const handleFocus = useCallback(() => {
    updateButtonVisibility(true)
  }, [updateButtonVisibility])

  const handleBlur = useCallback(() => {
    updateButtonVisibility(false)
  }, [updateButtonVisibility])

  const handleMouseOver = useCallback(() => {
    if (withSpellchecker && targetRef.current) {
      const wscBadge = document.querySelector('.wsc-badge--small.wsc-badge:hover')
      if (wscBadge) {
        updateButtonVisibility(false)
      }
    }
  }, [withSpellchecker, updateButtonVisibility])

  const handleMouseOut = useCallback(() => {
    if (targetRef.current && document.activeElement === targetRef.current) {
      updateButtonVisibility(true)
    }
  }, [updateButtonVisibility])

  useEffect(() => {
    if (!container) return

    const findTarget = (): HTMLElement | null => {
      // Try standard inputs first
      const standardInput = container.querySelector('input, textarea') as HTMLElement
      if (standardInput) return standardInput

      // Check if container itself is an input
      if (container.matches('input, textarea, [contenteditable="true"]')) {
        return container
      }

      // Try Froala element
      const froalaElement = container.querySelector('.fr-element') as HTMLElement
      if (froalaElement) return froalaElement

      return null
    }

    const setupTarget = (targetElement: HTMLElement) => {
      if (!buttonRef.current) return

      targetRef.current = targetElement

      targetElement.style.position = 'relative'

      const isInputElement = targetElement.tagName === 'INPUT'

      buttonRef.current.style.cssText = `
        position: absolute;
        bottom: ${!isInputElement ? '0.5rem' : '0'};
        right: ${withSpellchecker && !isInputElement ? '1.5rem' : '0.5rem'};
        opacity: 0;
        z-index: 9999;
      `

      // Attach to target or its parent
      const canContainChildren = !['INPUT', 'TEXTAREA'].includes(targetElement.tagName)

      if (canContainChildren) {
        if (!targetElement.contains(buttonRef.current)) {
          targetElement.appendChild(buttonRef.current)
        }
      } else {
        const parent = targetElement.parentElement
        if (parent && !parent.contains(buttonRef.current)) {
          parent.appendChild(buttonRef.current)
        }
      }

      // Clean up previous listeners
      targetElement.removeEventListener('focus', handleFocus)
      targetElement.removeEventListener('blur', handleBlur)

      // Add fresh listeners
      targetElement.addEventListener('focus', handleFocus)
      targetElement.addEventListener('blur', handleBlur)
    }

    // Initial setup
    const target = findTarget()
    if (target) {
      setupTarget(target)
    }

    // Watch for changes and re-setup when needed
    const observer = new MutationObserver(() => {
      const newTarget = findTarget()
      if (newTarget) {
        if (newTarget !== targetRef.current
          || (buttonRef.current && !newTarget.contains(buttonRef.current)
            && !newTarget.parentElement?.contains(buttonRef.current))) {
          setupTarget(newTarget)
        }
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: ['contenteditable', 'class'],
    })

    // Spellchecker handlers
    if (withSpellchecker) {
      document.addEventListener('mouseover', handleMouseOver, { passive: true })
      document.addEventListener('mouseout', handleMouseOut, { passive: true })
    }

    return () => {
      observer.disconnect()

      if (targetRef.current) {
        targetRef.current.removeEventListener('focus', handleFocus)
        targetRef.current.removeEventListener('blur', handleBlur)
      }

      if (withSpellchecker) {
        document.removeEventListener('mouseover', handleMouseOver)
        document.removeEventListener('mouseout', handleMouseOut)
      }
    }
  }, [container, withSpellchecker, handleFocus, handleBlur])

  return {
    buttonRef,
    targetRef,
  }
}
