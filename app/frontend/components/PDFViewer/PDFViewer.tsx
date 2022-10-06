import React, { useState, FC } from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import styles from './styles.less'

interface Props {
  fileUrl: string
  onLoadingComplete?: () => void
}

export const PDFViewer: FC<Props> = ({ fileUrl, onLoadingComplete }) => {
  const [numPages, setNumPages] = useState(1)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const handleLoading = (data: { loaded: number, total: number }) => {
    if (onLoadingComplete && data.loaded === data.total) onLoadingComplete()
  }

  return (
    <div>
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadProgress={handleLoading} loading="">
        {Array.from(new Array(numPages), (_, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} loading="" className={styles.page} />
        ))}
      </Document>
    </div>
  )
}
