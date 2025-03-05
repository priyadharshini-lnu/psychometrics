import { useEffect } from 'react'

export const useSetAccessibilityAttributesOnSelect = (containerRef, id) => {
  useEffect(() => {
    if (!containerRef.current) { return }
    const selectedLabel = containerRef.current.querySelector('.ant-select-selection-item')
    const inputElement = containerRef.current.querySelector('input')

    if (selectedLabel) {
      selectedLabel.setAttribute('id', id)
    }
    if (inputElement) {
      inputElement.removeAttribute('readonly')
      inputElement.removeAttribute('unselectable')
      const inputId = inputElement.getAttribute('id')
      inputElement.setAttribute('aria-labelledby', `${id} ${inputId}`)
    }
  }, [])
}
