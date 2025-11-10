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
        render 'auto_submit_form', locals: result[:ok]
      else
        error_message = result[:error]
        Rails.logger.error "OIDC Auth Error: #{error_message}"
        render json: { error: error_message }, status: :bad_request
      end
    end

    def redirect
      if @user_assessment
        campaign = @user_assessment&.campaign
        complete_user_assessment(@user_assessment)
        redirect_to assessment_completed_path(campaign.id, user_assessment_id: @user_assessment.id)
      else
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
  end
end
