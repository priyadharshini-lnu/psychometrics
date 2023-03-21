# frozen_string_literal: true

module Api
  class V2::Administration::WebhooksController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Webhook::Schema

    def policy_class
      Api::Administration::WebhookPolicy
    end

    def send_test
      @webhook = Webhook.find(params[:webhook_id])
      event = JSON.parse(params[:data][:attributes][:payload_data])

      response = ::Administration::Webhooks::TestWebhook.call(
        @webhook, event
      )

      audit_payload = {
        eventName: event['event_name'],
        response: response[:error] || I18n.t('frontend.test_webhook.success')
      }

      audit! :send_test, @webhook, payload: audit_payload, project: @webhook.project

      if response && response[:error]
        render json: { error: response[:error] }, status: 400
      else
        render json: {}
      end
    end

    def context
      super.merge(
        project_id: params[:project_id]
      )
    end
  end
end
