# frozen_string_literal: true

module Api
  class V2::Administration::WebhooksController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Webhook::Schema
    validates_request_schema :update, :update_request_contract_and_schema
    validates_request_schema :create, :create_request_contract_and_schema

    def update_request_contract_and_schema
      Api::V2::Webhook::Contract.new(
        schema: Api::V2::Webhook::Schema.update_request
      )
    end

    def create_request_contract_and_schema
      Api::V2::Webhook::Contract.new(
        schema: Api::V2::Webhook::Schema.create_request
      )
    end

    def policy_class
      Api::Administration::WebhookPolicy
    end

    def send_test
      @webhook = Webhook.find(params[:webhook_id])
      event = params[:data][:attributes][:payload_data]

      response = ::Administration::Webhooks::PushWebhook.call(
        @webhook, JSON.parse(event)
      )

      audit_payload = {
        eventName: event['event_name'],
        response: response[:error] || I18n.t('frontend.test_webhook.success')
      }

      audit! :send_test, @webhook, payload: audit_payload, project: @webhook.project

      if response && response[:error]
        render json: { error: response[:error] }, status: 400
      else
        render json: @webhook.event_logs.last.response
      end
    end

    def context
      super.merge(
        project_id: params[:project_id]
      )
    end
  end
end
