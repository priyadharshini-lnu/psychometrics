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

const FIELDS = [
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
        getValue: ({ key }) => `\${w://Workshop/Field/StartTime?format=${key}}`,
      },
      {
        name: 'End time',
        type: 'dropdown',
        items: () => _.map(DATE_FORMATS, f => ({ key: f.format, value: f.name })),
        getValue: ({ key }) => `\${w://Workshop/Field/EndTime?format=${key}}`,
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
        getValue: ({ key }) => `\${wi://WorkshopInvite/Field/Title?locale=${key}}`,
      },
      {
        name: 'Description',
        type: 'dropdown',
        items: () => _.map(LOCALES, f => ({ key: f.value, value: f.name })),
        getValue: ({ key }) => `\${wi://WorkshopInvite/Field/Description?locale=${key}}`,
      },
    ],
  },
  {
    branch: 'Users',
    fields: [
      {
        name: 'Magic URL',
        type: 'link',
        value: '${u://User/Field/MagicURL}',
      },
      {
        name: 'Magic Link',
        type: 'link',
        value: '${u://User/Field/MagicLink?text=Click here to login}',
      },
    ],
  },
  {
    branch: 'Campaigns',
    fields: [
      {
        name: 'Join Link',
        type: 'campaign_join_link',
        getValue: (campaignId, expire) => `\${c://Campaign/JoinLink?campaign_id=${campaignId}&expiry=${expire}}`,
      },
    ],
  },
]

export default FIELDS
