# frozen_string_literal: true

module DailyCo
  class SubscribeToWebhookJob < ApplicationJob
    queue_as :default

    def perform
      DailyCo::SubscribeToWebhook.call!
    end
  end
end
