# frozen_string_literal: true

module Faas
  class ZipS3Files < Base
    def call
      make_request

      broadcast :ok
    end

    private

    def function_name
      :zip_s3_files
    end

    def request_body
      compressed_details = Zlib::Deflate.deflate(options[:file_details].to_json)
      {
        fileDetails: Base64.encode64(compressed_details),
        zipFileKey: options[:zip_file_key],
        webhookMessage: webhook_message,
        webhookUrl: function_notifications_url
      }
    end

    def function_notifications_url
      faas_notifications_zip_s3_files_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        protocol: Settings.protocol
      )
    end
  end
end
