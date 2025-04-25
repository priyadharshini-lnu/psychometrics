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
    branch: 'Assessment Center',
    supportedCommunicationKind: [
      'workshop_booked', 'workshop_upcoming_reminder', 'workshop_cancelled', 'workshop_completed',
    ],
    fields: [
      {
        name: 'Start time',
        type: 'dropdown',
        items: () => _.map(DATE_FORMATS, f => ({ key: f.format, value: f.name })),
        getValue: (item?: { key?: string }) => `\${w://Workshop/Field/StartTime?format=${item?.key}}`,
      },
      {
        name: 'End time',
        type: 'dropdown',
        items: () => _.map(DATE_FORMATS, f => ({ key: f.format, value: f.name })),
        getValue: (item?: { key?: string }) => `\${w://Workshop/Field/EndTime?format=${item?.key}}`,
      },
      {
        name: 'Duration',
        type: 'link',
        value: '${w://Workshop/Field/Duration}',
      },
    ],
  },
  {
    branch: 'Invites',
    supportedCommunicationKind: [
      'workshop_invite', 'workshop_invite_reminder', 'workshop_booked', 'workshop_upcoming_reminder',
      'workshop_cancelled', 'workshop_completed',
    ],
    fields: [
      {
        name: 'Title',
        type: 'dropdown',
        items: () => _.map(LOCALES, f => ({ key: f.value, value: f.name })),
        getValue: (item?: { key?: string }) => `\${wi://WorkshopInvite/Field/Title?locale=${item?.key}}`,
      },
      {
        name: 'Description',
        type: 'dropdown',
        items: () => _.map(LOCALES, f => ({ key: f.value, value: f.name })),
        getValue: (item?: { key?: string }) => `\${wi://WorkshopInvite/Field/Description?locale=${item?.key}}`,
      },
    ],
  },
  {
    branch: 'Users',
    fields: [
      {
        name: 'Magic URL',
        type: 'magic_url',
        getValue: (campaignId, assessmentId) => (
          `\${u://User/Field/MagicURL?campaign_id=${campaignId}&assessment_id=${assessmentId}}`
        ),
      },
      {
        name: 'Magic Link',
        type: 'magic_link',
        getValue: (campaignId, assessmentId) => (
          // eslint-disable-next-line max-len
          `\${u://User/Field/MagicLink?campaign_id=${campaignId}&assessment_id=${assessmentId}&text=Click here to login}`
        ),
      },
    ],
  },
  {
    branch: 'Campaigns',
    fields: [
      {
        name: 'Join Link',
        type: 'campaign_join_link',

        getValue: (campaignId, expire, text) => (
          `\${c://Campaign/JoinLink?campaign_id=${campaignId}&text=${text}&expiry=${expire}}`
        ),
      },
      {
        name: 'Campaign Name',
        type: 'link',
        value: '${c://Campaign/Field}',
      },
    ],
  },
  {
    branch: 'Projects',
    fields: [
      {
        name: 'Project Name',
        type: 'link',
        value: '${p://Project/Field}',
      },
    ],
  },
  {
    branch: 'Platform Url and Links',
    fields: [
      {
        name: I18n.t('administration.piped_text_modal.insight_page_url'),
        type: 'link',
        value: '${pl://PlatformUrlAndLinksFields/Field/InsightPageURL}',
      },
      {
        name: I18n.t('administration.piped_text_modal.insight_page_link'),
        type: 'insight_page_link',
        getValue: text => (
          `\${pl://PlatformUrlAndLinksFields/Field/InsightPageLink?text=${text}}`
        ),
      },
    ],
  },
  {
    branch: 'User Reports',
    fields: [
      {
        name: I18n.t('administration.piped_text_modal.report_name'),
        type: 'link',
        value: '${ur://UserReportFields/Field/ReportName}',
      },
    ],
    supportedCommunicationKind: ['report_available'],
  },
]

export default FIELDS
