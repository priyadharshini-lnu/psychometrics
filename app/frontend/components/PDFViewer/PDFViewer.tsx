import { Button, InputNumber } from 'antd'
import React, { useState, FC } from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import styles from './styles.less'

interface Props {
  fileUrl: string
  onLoadingComplete?: () => void
}

const SCALE_STEP = 0.1
export const PDFViewer: FC<Props> = ({ fileUrl, onLoadingComplete }) => {
  const [numPages, setNumPages] = useState(1)
  const [scale, setScale] = useState(1)
  const [loaded, setLoaded] = useState(false)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setLoaded(true)
    setNumPages(numPages)
  }

  const handleLoading = (data: { loaded: number, total: number }) => {
    if (onLoadingComplete && data.loaded === data.total) onLoadingComplete()
  }

  const incrementScale = () => {
    setScale(scale => scale + SCALE_STEP)
  }

  const decrementScale = () => {
    setScale(scale => scale - SCALE_STEP)
  }

  return (
    <div className={styles.reportContainer}>
      <InputNumber
        value={`${Math.round(scale * 100)} %`}
        readOnly
        disabled={!loaded}
        width={40}
        className={styles.scaleChanger}
        addonBefore={<Button type="text" size="small" disabled={scale <= 0.7} onClick={decrementScale}>-</Button>}
        addonAfter={<Button type="text" size="small" disabled={scale >= 2} onClick={incrementScale}>+</Button>}
      />

      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadProgress={handleLoading} loading="">
        {Array.from(new Array(numPages), (_, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} loading="" className={styles.page} scale={scale} />
        ))}
      </Document>
    </div>
  )
}
