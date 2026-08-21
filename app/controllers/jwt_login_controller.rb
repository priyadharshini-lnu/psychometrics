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
      return redirect_to_token_reuse_return_url(
        token_reuse_result[:return_url],
        token_reuse_result[:application]
      )
    end

    error_type = resolved_token[:error]
    if error_type == :return_url_not_whitelisted
      return render(plain: I18n.t('shared.return_url_not_whitelisted'), status: :bad_request)
    end

    render plain: I18n.t('shared.authentication_failed'), status: :unauthorized
  end

  private

  def redirect_to_token_reuse_return_url(return_url, application)
    return render(plain: I18n.t('shared.authentication_failed'), status: :unauthorized) if return_url.blank?

    result = Jwt::Sso::ValidateReturnUrl.call(return_url: return_url, application: application)
    return render(plain: I18n.t('shared.return_url_not_whitelisted'), status: :bad_request) unless result[:ok]

    redirect_to(result[:ok], allow_other_host: true)
  end
end
