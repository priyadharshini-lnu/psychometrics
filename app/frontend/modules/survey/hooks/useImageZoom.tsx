import { useEffect, RefObject } from 'react'
import mediumZoom, { ZoomOptions } from 'medium-zoom'

type ImageZoomOptions = Pick<ZoomOptions, 'container' | 'template' | 'background' | 'margin'>

export function useImageZoom (
  ref: RefObject<HTMLDivElement>,
  options?: ImageZoomOptions,
): void {
  useEffect(() => {
    const images = ref.current?.querySelectorAll('img.zoom-image')
    const zoom = mediumZoom(images, options)

    return () => {
      zoom.detach()
    }
  }, [ref.current])
}
