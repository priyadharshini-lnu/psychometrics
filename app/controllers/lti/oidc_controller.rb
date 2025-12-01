# frozen_string_literal: true

module Lti
  class OidcController < ApplicationController
    layout 'end_user'

    before_action :set_user_assessment, only: %i[redirect]

    def auth
      form = Lti::OidcAuthForm.new(oidc_params)

      unless form.valid?
        error_message = form.errors.full_messages.join(', ')
        return render json: { error: error_message }, status: :bad_request
      end

      result = Lti::ProcessOidcAuth.call(form)

      if result[:ok]
        audit_oidc_auth_success(form)
        render 'auto_submit_form', locals: result[:ok]
      else
        error_message = result[:error]
        audit_oidc_auth_failure(form, error_message)
        Rails.logger.error "OIDC Auth Error: #{error_message}"
        render json: { error: error_message }, status: :bad_request
      end
    end

    def redirect
      if @user_assessment
        campaign = @user_assessment&.campaign
        complete_user_assessment(@user_assessment)
        audit_lti_assessment_completed(@user_assessment, campaign)
        redirect_to assessment_completed_path(campaign.id, user_assessment_id: @user_assessment.id)
      else
        audit_lti_redirect_failure
        redirect_to root_path
      end
    end

    private

    def set_user_assessment
      @user_assessment = UserAssessment.find_by(id: params[:id], evaluator_id: current_user.id)
    end

    def complete_user_assessment(user_assessment)
      user_assessment.complete! unless user_assessment.completed?
    end

    def oidc_params
      params.permit(
        :response_type,
        :scope,
        :login_hint,
        :lti_message_hint,
        :state,
        :redirect_uri,
        :client_id,
        :lti_deployment_id,
        :nonce
      )
    end

    def audit_oidc_auth_success(form)
      AuditLogModule.audit!(:lti_oidc_auth_success, nil,
                            payload: {
                              client_id: form.client_id,
                              deployment_id: form.lti_deployment_id,
                              login_hint: form.login_hint,
                              redirect_uri: form.redirect_uri
                            })
    end

    def audit_oidc_auth_failure(form, error_message)
      AuditLogModule.audit!(:lti_oidc_auth_failure, nil,
                            payload: {
                              error: error_message,
                              client_id: form.client_id,
                              deployment_id: form.lti_deployment_id,
                              login_hint: form.login_hint
                            })
    end

    def audit_lti_assessment_completed(user_assessment, campaign)
      AuditLogModule.audit!(:lti_assessment_completed, user_assessment,
                            campaign: campaign,
                            user: current_user,
                            payload: {
                              assessment_id: user_assessment.assessment.id,
                              assessment_name: user_assessment.assessment.name
                            })
    end

    def audit_lti_redirect_failure
      AuditLogModule.audit!(:lti_redirect_failure, nil,
                            user: current_user,
                            payload: {
                              error: 'User assessment not found',
                              user_assessment_id: params[:id]
                            })
    end
  end
end
