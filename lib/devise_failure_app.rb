# frozen_string_literal: true

class DeviseFailureApp < Devise::FailureApp
  # Temporary code, which can be remove in few days
  def respond
    Utility::Cookie.expire_auth_cookies(response) if warden_message == :timeout
    super
  end

  def redirect_url
    force_saml = request.params[:force_saml] == 'true'
    return super unless force_saml

    project = GetProjectBySubdomain.call!(request.subdomain)

    if project&.saml_login_allowed?
      return new_saml_user_session_path(return_url: attempted_path)
    end

    super
  end

  def i18n_locale
    project = GetProjectBySubdomain.call!(request.subdomain)
    request.cookies['locale'] || project&.available_locales&.first || I18n.default_locale
  end

  def attempted_path
    Utility::Url.remove_query_params(warden_options[:attempted_path], 'force_saml') if warden_options[:attempted_path]
  end
end
