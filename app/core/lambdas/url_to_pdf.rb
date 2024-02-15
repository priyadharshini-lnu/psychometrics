# frozen_string_literal: true

module Lambdas
  class UrlToPdf < Base
    private_attr_reader :options

    def initialize(options)
      @options = options
    end

    def call
      make_request_to_lambda

      broadcast :ok, s3_download_url
    end

    private

    def lambda_details
      @lambda_details ||= Settings.secrets.aws.dig(:lambda, :url_to_pdf)
    end

    def s3_download_url
      return if options[:async]

      content_disposition = "attachment; filename=\"#{File.basename(options[:output_file_path])}\""
      presigner = Aws::S3::Presigner.new
      presigner.presigned_url(:get_object,
                              bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
                              key: options[:output_file_path],
                              expires_in: 10.minutes.to_i,
                              response_content_disposition: content_disposition).to_s
    end

    def request_body
      body = options.slice(:url, :width, :height, :meta).
             merge(
               presignS3Url: get_presigned_url,
               webhookMessage: webhook_message,
               pdfPassword: options[:pdf_password]
             )
      return body unless options[:async]

      body.merge(webhookUrl: lambda_notifications_url)
    end

    def lambda_notifications_url
      lambda_notifications_url_to_pdf_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        protocol: Settings.protocol
      )
    end

    def get_presigned_url
      Aws::S3::Presigner.new.presigned_url(
        :put_object,
        bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
        key: options[:output_file_path],
        expires_in: expiry_time.to_i
      )
    end
  end
end
