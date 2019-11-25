# frozen_string_literal: true

module Threesixty
  class EmailTemplateForm < Threesixty::BaseEmailTemplateForm
    private

    def email_name
      context.email_template.name
    end
  end
end
