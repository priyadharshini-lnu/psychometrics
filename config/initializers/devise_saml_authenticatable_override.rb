# frozen_string_literal: true

require 'devise_saml_authenticatable'
require 'devise_saml_authenticatable/saml_config'

ALLOWED_IDP_ADAPTERS = %w[Saml::GetIdentityProviderSettings].freeze

DeviseSamlAuthenticatable::SamlConfig.class_eval do
  def idp_settings_adapter
    adapter = if Devise.idp_settings_adapter.is_a?(String)
                allowed_class = sanitize_and_validate_idp_adapter(Devise.idp_settings_adapter)
                @idp_settings_adapter ||= allowed_class.constantize
              else
                Devise.idp_settings_adapter
              end

    project_subdomain = request.subdomain
    project_subdomain = request.subdomain.gsub(/\.{0,1}#{Settings.subdomain}/, '') if Settings.subdomain
    adapter.new(project_subdomain)
  end

  private

  def sanitize_and_validate_idp_adapter(adapter_name)
    allowed_class = ALLOWED_IDP_ADAPTERS.find { |allowed_class| allowed_class == adapter_name }
    unless allowed_class
      raise ArgumentError,
            "Invalid IDP settings adapter: #{adapter_name}."
    end
    allowed_class
  end
end

ActionDispatch::Routing::Mapper.class_eval do
  protected

  alias_method :old_devise_saml_authenticatable, :devise_saml_authenticatable

  def devise_saml_authenticatable(mapping, controllers)
    controllers[:saml_sessions] = 'users/saml_sessions'
    old_devise_saml_authenticatable(mapping, controllers)
  end
end
