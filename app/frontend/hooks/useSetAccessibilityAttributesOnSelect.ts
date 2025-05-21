import { useEffect, MutableRefObject } from 'react'

export const useSetAccessibilityAttributesOnSelect = (
  containerRef: MutableRefObject<HTMLDivElement|null>, id:string, selectedValue:string,
) => {
  useEffect(() => {
    if (!containerRef.current) { return }
    const inputElement = containerRef.current.querySelector('input')

    if (inputElement) {
      inputElement.removeAttribute('readonly')
      inputElement.removeAttribute('unselectable')
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) { return }
    const selectedLabel = containerRef.current.querySelector('.ant-select-selection-item')
    const inputElement = containerRef.current.querySelector('input')

    if (selectedLabel) {
      selectedLabel.setAttribute('id', id)
    }
    if (inputElement) {
      const inputId = inputElement.getAttribute('id')
      inputElement.setAttribute('aria-labelledby', `${id} ${inputId}`)
    }
  }, [selectedValue])
}
