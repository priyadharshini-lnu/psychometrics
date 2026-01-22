# frozen_string_literal: true

module Faas
  class MediaToTranscription < Base
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
      :media_to_transcription
    end

    def request_body
      body = options.slice(:mediaUrl, :audioFormat, :meta).
             merge(
               webhookMessage: webhook_message
             )

      body.merge(webhookUrl: function_notifications_url)
    end

    def function_notifications_url
      faas_notifications_media_to_transcription_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        protocol: Settings.protocol
      )
    end

    def get_presigned_url
      ActiveStorage::Blob.new(
        key: options[:destinationKey],
        service_name: Settings.storage.private_storage_service
      ).service_url_for_direct_upload(expires_in: expiry_time.to_i)
    end
  end
end
