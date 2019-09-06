# frozen_string_literal: true

module Threesixty
  class SendScheduledEmailJob < ApplicationJob
    queue_as :default

    def perform
      Threesixty::Emails::SendScheduledEmails.call!
    end
  end
end
