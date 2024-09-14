# frozen_string_literal: true

module Lambdas
  class Base < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :options

    def initialize(options)
      @options = options
    end

    private

    def make_request_to_lambda
      if sqs_url
        send_message_to_sqs
      else
        make_http_request
      end
    end

    def send_message_to_sqs
      aws_config = Settings.secrets.aws[:config]
      Aws::SQS::Client.new(
        credentials: Aws::Credentials.new(
          aws_config[:access_key_id],
          aws_config[:secret_access_key]
        )
      ).send_message({
        queue_url: sqs_url,
        message_body: jwt_request_body
      })
    end

    def make_http_request
      request_thread = Thread.new do
        Faraday.post(lambda_details[:url]) do |req|
          req.options.timeout = 280
          req.body = jwt_request_body
        end
      end
      request_thread.join unless options[:async]
    end

    def sqs_url
      if options[:low_priority] || lambda_details[:priority_sqs_url].nil?
        lambda_details[:sqs_url]
      else
        lambda_details[:priority_sqs_url]
      end
    end

    def jwt_request_body
      encode_message(request_body)
    end

    def webhook_message
      return unless options[:webhook_message]

      encode_message(options[:webhook_message])
    end

    def encode_message(message)
      JWT.encode(
        { data: message, exp: expiry_time.from_now.to_i },
        signing_secret,
        'HS256'
      )
    end

    def expiry_time
      12.hours
    end

    def signing_secret
      @signing_secret ||= Settings.secrets.aws.dig(:lambda, :signing_secret)
    end

    def lambda_details
      raise "Define lambda_details in #{self.class.name}"
    end
  end
end
