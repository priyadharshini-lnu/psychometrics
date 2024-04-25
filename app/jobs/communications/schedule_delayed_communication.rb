# frozen_string_literal: true

module Communications
  class ScheduleDelayedCommunication < ApplicationJob
    def perform(communication, communication_email_attrs)
      communication.emails.create(communication_email_attrs)
    end
  end
end
