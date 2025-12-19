# frozen_string_literal: true

module Lti
  class ProcessOidcAuth < BaseCommand
    include Rails.application.routes.url_helpers

    def initialize(form)
      @form = form
    end

    def call
      integration = find_integration

      unless integration
        return broadcast(:error, "Unknown deployment_id: #{@form.lti_deployment_id}")
      end

      token_result = Lti::CreateIdToken.call(
        client_id: @form.client_id,
        redirect_uri: @form.redirect_uri,
        login_hint: @form.login_hint,
        lti_message_hint: @form.lti_message_hint,
        state: @form.state,
        nonce: @form.nonce,
        integration: integration
      )

      if token_result[:error]
        audit_token_creation_error(integration, token_result[:error])
        return broadcast(:error, token_result[:error])
      end

      audit_token_created(integration)

      result = {
        redirect_uri: @form.redirect_uri,
        id_token: token_result[:ok],
        state: @form.state
      }

      broadcast(:ok, result)
    rescue StandardError => e
      audit_processing_error(e.message)
      Rails.logger.error "OIDC Auth Error: #{e.message}"
      broadcast(:error, e.message)
    end

    private

    attr_reader :form

    def find_integration
      if @form.lti_deployment_id.present?
        Integration.find_by(id: @form.lti_deployment_id)
      else
        # TODO: Need to handle multiple LTI tools with in a project
        Integration.active.lti_tools.where(project_id: @form.client_id).first
      end
    end

    def audit_token_creation_error(integration, error)
      AuditLogModule.audit!(:lti_id_token_creation_error, integration,
                            project: integration.project,
                            payload: {
                              error: error,
                              client_id: @form.client_id,
                              login_hint: @form.login_hint
                            })
    end

    def audit_token_created(integration)
      AuditLogModule.audit!(:lti_id_token_created, integration,
                            project: integration.project,
                            payload: {
                              client_id: @form.client_id,
                              redirect_uri: @form.redirect_uri,
                              login_hint: @form.login_hint
                            })
    end

    def audit_processing_error(error_message)
      AuditLogModule.audit!(:lti_oidc_processing_error, nil,
                            payload: {
                              error: error_message,
                              deployment_id: @form.lti_deployment_id,
                              client_id: @form.client_id
                            })
    end
  end
end
