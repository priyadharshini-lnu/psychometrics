import { useRef } from 'react'
import useDimensions from 'react-use-dimensions'

export const useReportDimensions = () => {
  const [containerRef, containerSize] = useDimensions()
  const [reportRef, reportSize] = useDimensions()
  const reportSizeRef = useRef(null)
  if (reportSizeRef.current == null && reportSize.width) {
    reportSizeRef.current = reportSize.width
  }
  const scale = containerSize.width && reportSizeRef.current ? (containerSize.width / reportSizeRef.current) : 1

  return {
    scale, containerRef, reportRef, reportSize,
  }
}
