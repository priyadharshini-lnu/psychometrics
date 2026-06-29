import _ from 'lodash'

import dayjs from '~/utils/dayjs'

export const DATE_FORMATS = [
  {
    name: dayjs().format('Do MMMM YYYY, hh:mm A Z'),
    format: '%e %B %Y, %l:%M %p %:z',
  },
  {
    name: dayjs().format('YYYY-MM-DD hh:mm A Z'),
    format: '%Y-%m-%d %I:%M %p %:z',
  },
  {
    name: dayjs().format('DD-MM-YYYY- hh:mm A Z'),
    format: '%d-%m-%Y %I:%M %p %:z',
  },
  {
    name: dayjs().format('YYYY/MM/DD hh:mm A Z'),
    format: '%Y/%m/%d %I:%M %p %:z',
  },
  {
    name: dayjs().format('DD/MM/YYYY HH:mm:ss A Z'),
    format: '%d/%m/%Y %I:%M %p %:z',
  },
]
const { I18n } = window

const LOCALES = [
  {
    name: I18n.t('languages.en'),
    value: 'en',
  },
  {
    name: I18n.t('languages.ar'),
    value: 'ar',
  },
]
interface FieldItem {
  name: string;
  type: string;
  items?: () => { key: string; value: string }[];
  getValue?: (item?: { key?: string } | string, arg2?: string, arg3?: string) => string;
  value?: string;
}

interface FieldConfig {
  branch: string;
  supportedCommunicationKind?: string[];
  fields: FieldItem[];
}
const FIELDS: FieldConfig[] = [
  {
    branch: I18n.t('admin.piped_text_modal_assessment_center'),
    supportedCommunicationKind: [
      'workshop_booked', 'workshop_upcoming_reminder', 'workshop_cancelled', 'workshop_completed',
    ],
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_start_time'),
        type: 'dropdown',
        items: () => _.map(DATE_FORMATS, f => ({ key: f.format, value: f.name })),
        getValue: (item?: { key?: string }) => `\${w://Workshop/Field/StartTime?format=${item?.key}}`,
      },
      {
        name: I18n.t('admin.piped_text_modal_end_time'),
        type: 'dropdown',
        items: () => _.map(DATE_FORMATS, f => ({ key: f.format, value: f.name })),
        getValue: (item?: { key?: string }) => `\${w://Workshop/Field/EndTime?format=${item?.key}}`,
      },
      {
        name: I18n.t('admin.piped_text_modal_duration'),
        type: 'link',
        value: '${w://Workshop/Field/Duration}',
      },
    ],
  },
  {
    branch: I18n.t('admin.piped_text_modal_invites'),
    supportedCommunicationKind: [
      'workshop_invite', 'workshop_invite_reminder', 'workshop_booked', 'workshop_upcoming_reminder',
      'workshop_cancelled', 'workshop_completed',
    ],
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_invite_title'),
        type: 'dropdown',
        items: () => _.map(LOCALES, f => ({ key: f.value, value: f.name })),
        getValue: (item?: { key?: string }) => `\${wi://WorkshopInvite/Field/Title?locale=${item?.key}}`,
      },
      {
        name: I18n.t('shared.description'),
        type: 'dropdown',
        items: () => _.map(LOCALES, f => ({ key: f.value, value: f.name })),
        getValue: (item?: { key?: string }) => `\${wi://WorkshopInvite/Field/Description?locale=${item?.key}}`,
      },
    ],
  },
  {
    branch: I18n.t('admin.piped_text_modal_users'),
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_magic_url'),
        type: 'magic_url',
        getValue: (campaignId, assessmentId) => (
          `\${u://User/Field/MagicURL?campaign_id=${campaignId}&assessment_id=${assessmentId}}`
        ),
      },
      {
        name: I18n.t('admin.piped_text_modal_magic_link'),
        type: 'magic_link',
        getValue: (campaignId, assessmentId) => (
          // eslint-disable-next-line max-len
          `\${u://User/Field/MagicLink?campaign_id=${campaignId}&assessment_id=${assessmentId}&text=Click here to login}`
        ),
      },
    ],
  },
  {
    branch: I18n.t('admin.piped_text_modal_campaigns'),
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_magic_url'),
        type: 'campaign_join_link',

        getValue: (campaignId, expire, text) => (
          `\${c://Campaign/JoinLink?campaign_id=${campaignId}&text=${text}&expiry=${expire}}`
        ),
      },
      {
        name: I18n.t('admin.piped_text_modal_campaign_name'),
        type: 'link',
        value: '${c://Campaign/Field}',
      },
      {
        name: I18n.t('admin.piped_text_modal_campaign_link'),
        type: 'campaign_link',
        getValue: (campaignId, text) => (
          `\${c://Campaign/CampaignLink?campaign_id=${campaignId}&text=${text}}`
        ),
      },
    ],
  },
  {
    branch: I18n.t('admin.piped_text_modal_projects'),
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_project_name'),
        type: 'link',
        value: '${p://Project/Field}',
      },
    ],
  },
  {
    branch: I18n.t('admin.piped_text_modal_platform_url_links'),
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_insight_page_url'),
        type: 'link',
        value: '${pl://PlatformUrlAndLinksFields/Field/InsightPageURL}',
      },
      {
        name: I18n.t('admin.piped_text_modal_insight_page_link'),
        type: 'insight_page_link',
        getValue: text => (
          `\${pl://PlatformUrlAndLinksFields/Field/InsightPageLink?text=${text}}`
        ),
      },
    ],
  },
  {
    branch: I18n.t('admin.piped_text_modal_user_reports'),
    fields: [
      {
        name: I18n.t('admin.piped_text_modal_report_name'),
        type: 'link',
        value: '${ur://UserReportFields/Field/ReportName}',
      },
    ],
    supportedCommunicationKind: ['report_available'],
  },
]

export default FIELDS
