# frozen_string_literal: true

module Threesixty
  module Options
    class GlobalOptionForm < Rectify::Form
      ALL_BOOLEAN_FIELDS = %i[
        can_not_edit_evaluation
      ].freeze

      attribute :can_not_edit_evaluation, Boolean, deafult: false
      attribute :show_watermark, Boolean, deafult: false
      attribute :watermark_content, String

      validates(*ALL_BOOLEAN_FIELDS,
                inclusion: { in: [true, false], message: I18n.t('threesixty.options.form.value_not_valid') },
                allow_nil: true)
    end
  end
end
