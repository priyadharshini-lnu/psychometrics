import { FC, useMemo } from 'react'
import { I18nProvider } from '~/modules/idpReport/I18nContext'
import { IdpDataProvider } from '~/modules/idpReport/hooks/useIdpData'
import type { Template, PageStyles } from '~/modules/idpReport/store'
import { DUMMY_USER_IDP } from '~/modules/idpReport/dummyData'
import {
  PAGE_COMPONENTS, PREVIEW_HEIGHT, PAGE_WIDTH, PAGE_HEIGHT, PREVIEW_SCALE,
} from './constants'

const { I18n } = window

export interface PreviewTemplate {
  fields: string[]
  background?: string
  clientLogo?: string
  logoType: string
  titleText: string
  subtitleText: string
  guidelinePosition: string
  flipBackground: boolean
  pageStyles: PageStyles
}

const buildTemplateFromPreview = (preview: PreviewTemplate): Template => ({
  fields: preview.fields,
  background: preview.background,
  client_logo: preview.clientLogo,
  logo_type: preview.logoType,
  title_text: preview.titleText,
  subtitle_text: preview.subtitleText,
  guideline_position: preview.guidelinePosition,
  flip_background: preview.flipBackground,
  page_styles: preview.pageStyles,
})

const PagePreview: FC<{ pageKey: string; template: PreviewTemplate }> = ({ pageKey, template }) => {
  const Component = PAGE_COMPONENTS[pageKey]
  if (!Component) return null

  const idpData = useMemo(() => ({
    template: buildTemplateFromPreview(template),
    userIdp: DUMMY_USER_IDP,
  }), [template])

  return (
    <div style={{
      border: '1px solid #e8e8e8',
      borderRadius: 6,
      overflow: 'hidden',
      background: '#fafafa',
      height: PREVIEW_HEIGHT,
      width: PAGE_WIDTH * PREVIEW_SCALE,
    }}
    >
      <div style={{
        transform: `scale(${PREVIEW_SCALE})`,
        transformOrigin: 'top left',
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
      }}
      >
        <IdpDataProvider value={idpData}>
          <I18nProvider I18n={I18n}>
            <Component rtl={false} />
          </I18nProvider>
        </IdpDataProvider>
      </div>
    </div>
  )
}

export default PagePreview
