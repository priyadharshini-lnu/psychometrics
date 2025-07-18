# frozen_string_literal: true

class DeviseFailureApp < Devise::FailureApp
  def redirect_url
    force_saml = request.params[:force_saml] == 'true'
    return super unless force_saml

    project = GetProjectBySubdomain.call!(request.subdomain)

    return new_saml_user_session_path if project&.saml_login_allowed?

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
