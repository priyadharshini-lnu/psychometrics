# frozen_string_literal: true

module Threesixty
  class SendScheduledEmailJob < ApplicationJob
    def perform
      Threesixty::Emails::SendScheduledEmails.call!
    end
  end
end
