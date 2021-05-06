# frozen_string_literal: true

module Lambdas
  class UrlToPdf < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :options

    def initialize(options)
      @options = options
    end

    def call
      if lambda_config.dig(:url_to_pdf, :sqs_url)
        send_message_to_sqs
      else
        make_http_request
      end

      broadcast :ok, s3_download_url
    end

    private

    def lambda_config
      @lambda_config ||= Rails.application.secrets.aws[:lambda]
    end

    def s3_download_url
      return if options[:async]

      content_disposition = "attachment; filename=\"#{File.basename(options[:output_file_path])}\""
      presigner = Aws::S3::Presigner.new
      presigner.presigned_url(:get_object,
                              bucket: Rails.application.secrets.directory,
                              key: options[:output_file_path],
                              expires_in: 10.minutes.to_i,
                              response_content_disposition: content_disposition).to_s
    end

    def send_message_to_sqs
      Aws::SQS::Client.new.send_message({
        queue_url: lambda_config.dig(:url_to_pdf, :sqs_url),
        message_body: jwt_request_body,
        message_group_id: 'group1'
      })
    end

    def make_http_request
      request_thread = Thread.new do
        Faraday.post(lambda_config.dig(:url_to_pdf, :url)) do |req|
          req.options.timeout = 280
          req.body = jwt_request_body
        end
      end
      request_thread.join unless options[:async]
    end

    def jwt_request_body
      JWT.encode(
        { data: request_body, exp: 2.minutes.from_now.to_i },
        lambda_config[:signing_secret],
        'HS256'
      )
    end

    def request_body
      body = options.slice(:url, :width, :height).
             merge(
               presignS3Url: get_presigned_url,
               webhookMessage: webhook_message
             )
      return body unless options[:async]

      sns_arn = lambda_config.dig(:url_to_pdf, :snsArn)
      return body.merge(snsArn: sns_arn) if sns_arn

      body.merge(webhookUrl: lambda_notifications_url)
    end

    def webhook_message
      JWT.encode(
        { data: options[:webhook_message], exp: 10.minutes.from_now.to_i },
        lambda_config[:signing_secret],
        'HS256'
      )
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
        bucket: Rails.application.secrets.directory,
        key: options[:output_file_path],
        expires_in: 6000
      )
    end
  end
end
