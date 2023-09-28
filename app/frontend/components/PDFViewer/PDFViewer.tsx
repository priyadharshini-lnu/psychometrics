import { Button, InputNumber, Skeleton } from 'antd'
import { useState, FC } from 'react'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry'
import styles from './styles.less'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

interface Props {
  fileUrl: string
  onLoadingComplete?: () => void
}

const SCALE_STEP = 0.12
const INITIAL_SCALE = 1.2
export const PDFViewer: FC<Props> = ({ fileUrl, onLoadingComplete }) => {
  const [numPages, setNumPages] = useState(1)
  const [scale, setScale] = useState(INITIAL_SCALE)
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
  const percentage = Math.round(scale * (1 / INITIAL_SCALE * 100))

  return (
    <div className={styles.reportContainer}>
      <InputNumber
        value={`${percentage} %`}
        readOnly
        disabled={!loaded}
        width={40}
        className={styles.scaleChanger}
        addonBefore={<Button type="text" size="small" disabled={percentage <= 80} onClick={decrementScale}>-</Button>}
        addonAfter={<Button type="text" size="small" disabled={percentage >= 180} onClick={incrementScale}>+</Button>}
      />

      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadProgress={handleLoading} loading="">
        {Array.from(new Array(numPages), (_, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} loading="" className={styles.page} scale={scale} />
        ))}
      </Document>
      {!loaded && (
        <>
          <Skeleton active paragraph={{ rows: 20, width: '768px' }} />
        </>
      )}
    </div>
  )
}
