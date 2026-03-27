# frozen_string_literal: true

module Threesixty
  module Options
    class GlobalOptionForm < Rectify::Form
      ALL_BOOLEAN_FIELDS = %i[
        can_not_edit_evaluation
        system_check_enabled
        allow_continue_with_warning
      ].freeze

      attribute :can_not_edit_evaluation, Boolean, default: false
      attribute :show_watermark, Boolean, default: false
      attribute :watermark_content, String
      attribute :system_check_enabled, Boolean
      attribute :system_check_validity, Integer
      attribute :allow_continue_with_warning, Boolean
      attribute :minimum_upload_speed, Integer
      attribute :minimum_download_speed, Integer

      validates(*ALL_BOOLEAN_FIELDS,
                inclusion: { in: [true, false], message: I18n.t('threesixty.options.form.value_not_valid') },
                allow_nil: true)
    end
  end
end
