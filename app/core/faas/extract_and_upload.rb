# frozen_string_literal: true

module Faas
  class ExtractAndUpload < Base
    private_attr_reader :options

    def initialize(options)
      @options = options
    end

    def call
      make_request

      broadcast :ok
    end

    private

    def function_name
      :extract_and_upload
    end

    def request_body
      options.merge(webhookMessage: webhook_message, webhookUrl: function_notifications_url)
    end

    def function_notifications_url
      faas_notifications_extract_and_upload_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        protocol: Settings.protocol
      )
    end
  end
end
