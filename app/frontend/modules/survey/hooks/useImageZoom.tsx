import { useEffect, RefObject } from 'react'
import mediumZoom from 'medium-zoom'

export function useImageZoom (
  ref: RefObject<HTMLDivElement>,
): void {
  useEffect(() => {
    const images = ref.current?.querySelectorAll('img.zoom-image')
    const zoom = mediumZoom(images)

    return () => {
      zoom.detach()
    }
  }, [ref.current])
}
