# frozen_string_literal: true

module Api
  class V2::Administration::CommunicationDeliveriesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    validate_crud_requests Api::V2::CommunicationDelivery::Schema
    validates_request_schema :create, :create_request_contract_and_schema
    validates_request_schema :update_translation, :update_translation_request_contract_and_schema

    def show
      locale = params.dig(:query, :locale) || I18n.default_locale

      Mobility.with_locale(locale) { jsonapi_render json: @model }
    end

    def update_translation
      locale = params[:data][:attributes][:locale]

      Mobility.with_locale(locale) do
        @model.update!(params[:data][:attributes].slice(:subject, :body))
        jsonapi_render json: @model
      end
    rescue StandardError
      render json: {
        error: t('administration.communication_center.errors.update_translation')
      }, status: :bad_request
    end

    def cancel
      delivery = resource

      if %w[completed cancelled failed].include?(delivery.status)
        detail = t('administration.communication_center.errors.terminal_state')

        return jsonapi_render_errors [{ detail: detail }], status: :unprocessable_entity
      end

      delivery.update!(status: :cancelled, cancelled_at: Time.current)
      jsonapi_render json: delivery
    end

    private

    def authorize_create
      relationships = params.dig(:data, :relationships) || {}
      authorize CommunicationDelivery, :create?, policy_class: Api::Administration::CommunicationDeliveryPolicy,
                                                  project_id: relationships.dig(:project, :data, :id),
                                                  campaign_id: relationships.dig(:campaign, :data, :id)
    end

    def resource
      @resource ||= Api::Administration::CommunicationDeliveryPolicy::Scope.new(current_user, CommunicationDelivery).
                    resolve.find(params[:id])
    end

    def create_request_contract_and_schema
      Api::V2::CommunicationDelivery::Contract.new(
        schema: Api::V2::CommunicationDelivery::Schema.create_request
      )
    end

    def update_translation_request_contract_and_schema
      Api::V2::CommunicationCenter::UpdateTranslationContract.new(
        schema: Api::V2::CommunicationDelivery::Schema.update_translation_request
      )
    end
  end
end
