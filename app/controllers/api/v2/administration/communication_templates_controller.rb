# frozen_string_literal: true

module Api
  class V2::Administration::CommunicationTemplatesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    validate_crud_requests Api::V2::CommunicationTemplate::Schema
    validates_request_schema :create, :create_request_contract_and_schema
    validates_request_schema :update, :update_request_contract_and_schema
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

    private

    def authorize_create
      relationships = params.dig(:data, :relationships) || {}
      # project_id: accepts any clients.id (plain client or project row) -- codebase-wide idiom, see
      # User#has_permission? / cached_project_for_permission.
      scope_project_id = relationships.dig(:client, :data, :id) || relationships.dig(:project, :data, :id)
      authorize CommunicationTemplate, :create?, policy_class: Api::Administration::CommunicationTemplatePolicy,
                                                  project_id: scope_project_id,
                                                  campaign_id: relationships.dig(:campaign, :data, :id)
    end

    def create_request_contract_and_schema
      Api::V2::CommunicationTemplate::Contract.new(
        schema: Api::V2::CommunicationTemplate::Schema.create_request
      )
    end

    def update_request_contract_and_schema
      Api::V2::CommunicationTemplate::Contract.new(
        schema: Api::V2::CommunicationTemplate::Schema.update_request
      )
    end

    def update_translation_request_contract_and_schema
      Api::V2::CommunicationCenter::UpdateTranslationContract.new(
        schema: Api::V2::CommunicationTemplate::Schema.update_translation_request
      )
    end
  end
end
