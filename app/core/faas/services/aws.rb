# frozen_string_literal: true

module Faas
  class Services::Aws
    private_attr_reader :options, :lambda_details

    def initialize(lambda_details, options)
      @options = options
      @lambda_details = lambda_details
    end

    def call(payload = nil)
      if sqs_url
        send_message_to_sqs(payload)
      else
        make_http_request(payload)
      end
    end

    private

    def send_message_to_sqs(payload)
      aws_config = Settings.secrets.aws[:config]
      Aws::SQS::Client.new(
        credentials: Aws::Credentials.new(
          aws_config[:access_key_id],
          aws_config[:secret_access_key]
        )
      ).send_message({
        queue_url: sqs_url,
        message_body: payload
      })
    end

    def make_http_request(payload)
      Faraday.post(lambda_details[:url]) do |req|
        req.options.timeout = 280
        req.body = payload.to_json
      end
    end

    def sqs_url
      if options[:low_priority] || lambda_details[:priority_sqs_url].nil?
        lambda_details[:sqs_url]
      else
        lambda_details[:priority_sqs_url]
      end
    end
  end
end
