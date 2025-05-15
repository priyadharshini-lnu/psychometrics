# frozen_string_literal: true

module Faas
  class UrlToPdf < Base
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
      :url_to_pdf
    end

    def request_body
      body = options.slice(:url, :width, :height, :meta).
             merge(
               presignS3Url: get_presigned_url,
               webhookMessage: webhook_message,
               pdfPassword: options[:pdf_password]
             )

      body.merge(webhookUrl: function_notifications_url)
    end

    def function_notifications_url
      faas_notifications_url_to_pdf_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        protocol: Settings.protocol
      )
    end

    def get_presigned_url
      ActiveStorage::Blob.new(
        key: options[:output_file_path], service_name: Settings.storage.private_storage_service
      ).service_url_for_direct_upload(expires_in: expiry_time.to_i)
    end
  end
end
