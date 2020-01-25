# frozen_string_literal: true

module Threesixty
  class EmailScheduleForm < Threesixty::BaseEmailTemplateForm
    attribute :name, String
    attribute :recipient_criteria, Array
    attribute :scheduled_date, DateTime
    attribute :recipient_ids, Array

    private

    def email_name
      name
    end
  end
end
