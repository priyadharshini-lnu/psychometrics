# frozen_string_literal: true

module Webhooks
  class MhsController < ActionController::Base
    skip_before_action :verify_authenticity_token
    before_action :authenticate_webhook, only: [:webhook], if: -> { request.post? }

    def webhook
      case request.method
        when 'HEAD'
          handle_head_request
        when 'OPTIONS'
          handle_webhook_verification
        when 'POST'
          handle_webhook_event
        else
          head :method_not_allowed
      end
    end

    private

    def handle_head_request
      response.headers['Cache-Control'] = 'no-cache, no-store'
      head :ok
    end

    def handle_webhook_verification
      # https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/http-webhook.md#41-validation-request
      response.headers['WebHook-Allowed-Origin'] = request.headers['Origin'] || '*'
      response.headers['WebHook-Allowed-Rate'] = '1000'
      response.headers['Access-Control-Allow-Origin'] = '*'
      response.headers['Access-Control-Allow-Methods'] = 'HEAD, POST, OPTIONS'
      response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

      head :ok
    end

    def handle_webhook_event
      response.headers['WebHook-Allowed-Origin'] = request.headers['Origin'] || '*'

      payload = JSON.parse(request.raw_post)
      process_webhook_payload(payload)

      head :ok
    rescue JSON::ParserError => e
      Rails.logger.error("Invalid JSON in MHS webhook: #{e.message}")
      head :bad_request
    end

    def authenticate_webhook
      provided_key = request.headers['Authorization']
      expected_key = Settings.secrets.mhs.webhook_api_key

      if expected_key.blank? || provided_key.blank? ||
         !ActiveSupport::SecurityUtils.secure_compare(provided_key, expected_key)
        Rails.logger.warn('MHS webhook authentication failed')
        head :unauthorized
        return false
      end

      true
    end

    def process_webhook_payload(payload)
      return unless payload['type'] == 'MHS.Janus.DataGatherer.Complete'

      handle_data_gatherer_complete(payload)
    end

    def handle_data_gatherer_complete(payload)
      data_gathering_id = extract_data_gathering_id(payload['source'])
      return unless data_gathering_id

      user_assessment = find_user_assessment(data_gathering_id)
      return unless user_assessment
      return unless successful_completion?(payload)

      user_assessment.update!(status: :completed, completed_at: Time.current)
      Mhs::HandleAssessmentCompletion.call!(user_assessment)
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error("MHS webhook error: #{e.message}")
    end

    def successful_completion?(payload)
      details = payload.dig('data', 'details') || []
      details.any? && details.all? { |d| d['code'] == 200 }
    end

    def extract_data_gathering_id(source_url)
      uri = URI.parse(source_url)
      path_parts = uri.path.split('/')
      instances_index = path_parts.index('instances')

      instances_index ? path_parts[instances_index + 1] : nil
    rescue URI::InvalidURIError
      nil
    end

    def find_user_assessment(data_gathering_id)
      UserAssessment.joins(:mhs_user_assessment).
        find_by(mhs_user_assessments: { data_gathering_id: data_gathering_id })
    end
  end
end
