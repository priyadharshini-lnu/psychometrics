# frozen_string_literal: true

module Threesixty
  class EmailTemplateForm < Threesixty::BaseEmailTemplateForm
    attribute :daily_digest, Boolean, default: false
    attribute :schedule_time, String
    attribute :meta, Hash, default: {}

    private

    def email_name
      context.email_template.name
    end
  end
end
