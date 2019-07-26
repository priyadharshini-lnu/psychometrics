# frozen_string_literal: true

module Threesixty
  class SendRemindersEmailJob < ApplicationJob
    queue_as :default

    def perform
      Threesixty::Emails::SendReminders.call!
    end
  end
end
