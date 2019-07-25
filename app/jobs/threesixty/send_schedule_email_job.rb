# frozen_string_literal: true

module Threesixty
  class SendScheduleEmailJob < ApplicationJob
    queue_as :default

    def perform
      Threesixty::SendScheduleEmails.call!
    end
  end
end
