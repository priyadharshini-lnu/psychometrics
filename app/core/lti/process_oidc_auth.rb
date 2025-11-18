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
        nonce: @form.nonce,
        integration: integration
      )

      if token_result[:error]
        return broadcast(:error, token_result[:error])
      end

      result = {
        redirect_uri: @form.redirect_uri,
        id_token: token_result[:ok],
        state: @form.state
      }

      broadcast(:ok, result)
    rescue StandardError => e
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
  end
end
