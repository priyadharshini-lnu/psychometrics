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

    def copy
      result = Communications::CopyTemplate.call(
        source_template,
        current_user,
        target_client_id: target_client_id,
        target_project_id: target_project_id,
        target_campaign_id: target_campaign_id
      )

      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ detail: result[:error] }], status: :unprocessable_entity
      end
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

    def authorize_copy
      return authorize_target_scope if target_authorization_required?

      authorize source_template, :copy?, policy_class: Api::Administration::CommunicationTemplatePolicy
    end

    def source_template
      @source_template ||= Api::Administration::CommunicationTemplatePolicy::Scope.new(
        current_user,
        CommunicationTemplate
      ).resolve.find(params[:id])
    end

    def authorize_target_scope
      return if source_template.platform? || source_template.client?
      return if source_template.project? && target_project_id.blank?
      return if source_template.campaign? && target_campaign_id.blank?

      authorize CommunicationTemplate, :copy_to?, policy_class: Api::Administration::CommunicationTemplatePolicy,
                                                     project_id: target_scope_project_id,
                                                     campaign_id: target_scope_campaign_id
    end

    def target_authorization_required?
      (source_template.project? && target_project_id.present?) ||
        (source_template.campaign? && target_campaign_id.present?)
    end

    def target_scope_project_id
      return target_project_id if source_template.project?

      target_campaign&.project_id
    end

    def target_scope_campaign_id
      target_campaign_id if source_template.campaign?
    end

    def target_campaign
      @target_campaign ||= ActsAsTenant.without_tenant { Campaign.find_by(id: target_campaign_id) }
    end

    def target_client_id
      params.dig(:data, :attributes, :target_client_id)
    end

    def target_project_id
      params.dig(:data, :attributes, :target_project_id)
    end

    def target_campaign_id
      params.dig(:data, :attributes, :target_campaign_id)
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
