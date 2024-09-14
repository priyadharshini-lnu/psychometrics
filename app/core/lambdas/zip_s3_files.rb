# frozen_string_literal: true

module Lambdas
  class ZipS3Files < Base
    def call
      make_request_to_lambda

      broadcast :ok
    end

    private

    def lambda_details
      @lambda_details ||= Settings.secrets.aws.dig(:lambda, :zip_s3_files)
    end

    def request_body
      compressed_details = Zlib::Deflate.deflate(options[:file_details].to_json)
      {
        fileDetails: Base64.encode64(compressed_details),
        zipFileKey: options[:zip_file_key],
        webhookMessage: webhook_message,
        webhookUrl: lambda_notifications_url
      }
    end

    def lambda_notifications_url
      lambda_notifications_zip_s3_files_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        protocol: Settings.protocol
      )
    end
  end
end
