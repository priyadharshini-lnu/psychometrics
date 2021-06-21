import { DateFormat } from 'modules/survey/interfaces/questions/TextEntry'

const { I18n } = window

export const ANSWER_TYPE_OPTIONS = [
  {
    label: 'Single line',
    value: 'SingleLine',
  },
  {
    label: 'Multi line',
    value: 'MultiLine',
  },
  {
    label: 'Essay text box',
    value: 'EssayTextBox',
  },
  {
    label: 'Form',
    value: 'Form',
  },
  {
    label: 'Password',
    value: 'Password',
  },
  {
    label: 'Date',
    value: 'DateEntry',
  },
  {
    label: 'Date & time',
    value: 'DateTimeEntry',
  },
  {
    label: 'Time',
    value: 'TimeEntry',
  },
  {
    label: 'Chat',
    value: 'Chat',
  },
  {
    label: 'Email',
    value: 'Email',
  },
]

export const DATE_FORMAT_OPTIONS = [
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.date_format_options.dd_mm_yyy',
    ),
    value: DateFormat['DD-MM-YYYY'],
  },
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.date_format_options.yyyy_mm_dd',
    ),
    value: DateFormat['YYYY-MM-DD'],
  },
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.date_format_options.mm_yyyy',
    ),
    value: DateFormat['MM-YYYY'],
  },
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.date_format_options.yyyy_mm',
    ),
    value: DateFormat['YYYY-MM'],
  },
]
