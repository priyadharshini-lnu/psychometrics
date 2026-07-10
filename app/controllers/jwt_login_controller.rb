# frozen_string_literal: true

class JwtLoginController < ApplicationController
  include SsoNavigation

  skip_before_action :authenticate_user!, only: :login_jwt
  skip_before_action :verify_authenticity_token, only: :login_jwt

  def login_jwt
    resolved_token = ::Jwt::Sso::ResolveBearerToken.call(token: params[:token])

    if resolved_token[:ok]
      result = resolved_token[:ok]
      user = result[:participant]

      session[:sso] = {
        'user_id' => user.id,
        'return_url' => result[:return_url],
        'user_assessment_id' => result[:user_assessment_id],
        'source' => 'jwt_post'
      }
      add_cookie(:sso_session, 'true')
      sign_in(user)

      if result[:target_type] == 'asmt' && result[:user_assessment_id].present?
        user_assessment = UserAssessment.find_by(id: result[:user_assessment_id], evaluator_id: current_user.id)
        return handle_assessment_target_flow(user_assessment)
      end

      return redirect_to(campaign_path(result[:campaign_id])) if result[:campaign_id].present?

      return redirect_to(root_path)
    end

    if resolved_token[:token_reuse_detected]
      token_reuse_result = resolved_token[:token_reuse_detected]
      if token_reuse_result[:return_url].blank?
        return render(plain: I18n.t('shared.authentication_failed'), status: :unprocessable_entity)
      end

      return redirect_to(token_reuse_result[:return_url], allow_other_host: true)
    end

    render plain: I18n.t('shared.authentication_failed'), status: :unprocessable_entity
  end
end
