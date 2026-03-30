import { FC } from 'react'
import Cover from '~/modules/idpReport/Page/types/Cover/Cover'
import Last from '~/modules/idpReport/Page/types/Last/Last'
import Guidelines from '~/modules/idpReport/Page/types/Guidelines/Guidelines'
import ReportSummary from '~/modules/idpReport/Page/types/ReportSummary/ReportSummary'
import IDP from '~/modules/idpReport/Page/types/IDP/IDP'
import Reflections from '~/modules/idpReport/Page/types/Reflections/Reflections'

export const PAGE_COMPONENTS: Record<string, FC<{ rtl: boolean }>> = {
  cover: Cover,
  guidelines: Guidelines,
  report_summary: ReportSummary,
  idp: IDP,
  reflections: Reflections,
  last: Last,
}

export const LOGO_TYPE = {
  both: 'both',
  mercer_only: 'mercer_only',
  client_only: 'client_only',
  none: 'none',
}

export const FIELDS = [
  'name',
  'current_job_role',
  'target_job_role',
  'assigned_date',
  'division',
  'approval_date',
  'publish_date',
  'completion_date',
]

export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
]

const { I18n } = window

export const PAGE_KEYS = [
  { key: 'cover', label: I18n.t('admin.idp_appearance_cover') },
  { key: 'guidelines', label: I18n.t('admin.idp_appearance_guidelines') },
  { key: 'report_summary', label: I18n.t('admin.idp_appearance_report_summary') },
  { key: 'idp', label: I18n.t('admin.idp_appearance_idp_skills') },
  { key: 'reflections', label: I18n.t('admin.idp_appearance_reflections') },
  { key: 'last', label: I18n.t('admin.idp_appearance_last') },
]

export const DEFAULT_PAGE_STYLES = {
  cover: {
    title: { fontFamily: 'Arial', fontSize: 72, fontColor: '#29504D' },
    subtitle: { fontFamily: 'Arial', fontSize: 24, fontColor: '#29504D' },
    body: { fontFamily: 'Arial', fontSize: 18, fontColor: '#29504D' },
  },
  guidelines: {
    title: { fontFamily: 'Arial', fontSize: 24, fontColor: '#29504D' },
    subtitle: { fontFamily: 'Arial', fontSize: 18, fontColor: '#565656' },
    body: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
  },
  report_summary: {
    title: { fontFamily: 'Arial', fontSize: 24, fontColor: '#29504D' },
    subtitle: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
    body: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
    sectionTitle: { fontFamily: 'Arial', fontSize: 16, fontColor: '#29504D' },
    sectionSubtitle: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
    sectionBody: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
  },
  idp: {
    title: { fontFamily: 'Arial', fontSize: 24, fontColor: '#29504D' },
    subtitle: { fontFamily: 'Arial', fontSize: 14, fontColor: '#29504D' },
    body: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
    sectionTitle: { fontFamily: 'Arial', fontSize: 20, fontColor: '#29504D' },
    sectionSubtitle: { fontFamily: 'Arial', fontSize: 16, fontColor: '#0B0B0B' },
    sectionBody: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
  },
  reflections: {
    title: { fontFamily: 'Arial', fontSize: 24, fontColor: '#29504D' },
    subtitle: { fontFamily: 'Arial', fontSize: 18, fontColor: '#565656' },
    sectionTitle: { fontFamily: 'Arial', fontSize: 16, fontColor: '#29504D' },
    sectionBody: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
  },
  last: {
    title: { fontFamily: 'Arial', fontSize: 60, fontColor: '#29504D' },
    subtitle: { fontFamily: 'Arial', fontSize: 24, fontColor: '#29504D' },
    body: { fontFamily: 'Arial', fontSize: 14, fontColor: '#565656' },
  },
}

export const PREVIEW_HEIGHT = 480
export const PAGE_WIDTH = 1123
export const PAGE_HEIGHT = 794
export const PREVIEW_SCALE = PREVIEW_HEIGHT / PAGE_HEIGHT
