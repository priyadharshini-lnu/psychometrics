import React, { useState, useEffect } from 'react'

import { PageLoadSpinner, DefaultAntThemeWrapper } from '~/glint'

export const withLoadingSpinner = (Component: (props:object) => React.ReactElement, maxWaitTime: number) => (
  props: object,
) => {
  const [pageLoading, setPageLoading] = useState(true)

  const pageLoadHandler = () => {
    setPageLoading(false)
  }
  useEffect(() => {
    window.addEventListener('load', pageLoadHandler)
    const pageLoadTimeout = setTimeout(() => {
      setPageLoading && setPageLoading(false)
    }, maxWaitTime)
    return () => {
      window.removeEventListener('load', pageLoadHandler)
      clearTimeout(pageLoadTimeout)
    }
  }, [])

  if (pageLoading) {
    return (
      <DefaultAntThemeWrapper>
        <PageLoadSpinner size="large" />
      </DefaultAntThemeWrapper>
    )
  }

  return <Component {...props} />
}
