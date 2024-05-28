const { I18n } = window

export const ANSWER_TYPE_OPTIONS = [
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.multiple_choice_types.single_answer',
    ),
    value: 'SingleAnswer',
  },
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.multiple_choice_types.multi_answer',
    ),
    value: 'MultipleAnswer',
  },
  {
    label: I18n.t(
      'administration.survey_builder.property_panel.multiple_choice_types.dropdown',
    ),
    value: 'Dropdown',
  },
]
