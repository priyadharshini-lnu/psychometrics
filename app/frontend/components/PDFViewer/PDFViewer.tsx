import { FC, useState } from 'react'
import { Button, InputNumber, Skeleton } from 'antd'
import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import styles from './styles.less'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

interface Props {
  fileUrl: string
  onLoadingComplete?: () => void
}

const SCALE_STEP = 0.12
const INITIAL_SCALE = 1.2
export const PDFViewer: FC<Props> = ({ fileUrl, onLoadingComplete }) => {
  const [numPages, setNumPages] = useState<number>(1)
  const [scale, setScale] = useState(INITIAL_SCALE)
  const [loaded, setLoaded] = useState(false)
  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: PDFDocumentProxy) => {
    setNumPages(nextNumPages)
    setLoaded(true)
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
    <div className={styles.container}>
      <InputNumber
        value={`${percentage} %`}
        readOnly
        disabled={!loaded}
        width={40}
        className={styles.scaleChanger}
        addonBefore={(
          <Button
            type="text"
            size="small"
            disabled={percentage <= 80}
            onClick={decrementScale}
          >
            -
          </Button>
            )}
        addonAfter={(
          <Button
            type="text"
            size="small"
            disabled={percentage >= 180}
            onClick={incrementScale}
          >
            +
          </Button>
            )}
      />
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadProgress={handleLoading}
        loading=""
        className={styles.document}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            loading=""
            scale={scale}
            className={styles.page}
          />
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
