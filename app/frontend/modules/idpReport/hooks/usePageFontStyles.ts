import { useMemo } from 'react'
import { useTemplate } from './useIdpData'

type PageKey = 'cover' | 'guidelines' | 'report_summary' | 'idp' | 'reflections' | 'last'

interface FontStyle {
  fontFamily?: string
  fontSize?: string
  fontColor?: string
}

const toCSS = (font?: FontStyle) => {
  if (!font) return undefined
  return {
    fontFamily: font.fontFamily,
    fontSize: font.fontSize,
    color: font.fontColor,
  }
}

export const usePageFontStyles = (pageKey: PageKey) => {
  const template = useTemplate()
  const pageStyle = template.page_styles?.[pageKey]

  return useMemo(() => ({
    titleStyle: toCSS(pageStyle?.title),
    subtitleStyle: toCSS(pageStyle?.subtitle),
    bodyStyle: toCSS(pageStyle?.body),
    sectionTitleStyle: toCSS(pageStyle?.sectionTitle),
    sectionSubtitleStyle: toCSS(pageStyle?.sectionSubtitle),
    sectionBodyStyle: toCSS(pageStyle?.sectionBody),
  }), [pageStyle])
}
