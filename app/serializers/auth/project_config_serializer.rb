# frozen_string_literal: true

module Auth
  class ProjectConfigSerializer < Panko::Serializer
    attributes :id, :background_color, :login_box_position, :background, :background_overlay, :saml_login_allowed,
               :saml_enforced, :saml_domain_enforcement_enabled, :client_logo, :secondary_logo, :primary_color,
               :error_color, :warning_color, :success_color, :info_color, :background_size, :require_mobile_number,
               :hide_signup, :magic_link_enabled, :disallow_password_login, :logo_alt_text,
               :enable_recaptcha, :glint_ui, :privacy_link_text, :privacy_link_url, :enable_privacy_link

    DELEGATE_METHODS = %i[primary_color error_color warning_color success_color info_color].freeze

    DELEGATE_METHODS.each do |name|
      define_method name do
        design_setting.send(name) if design_setting.respond_to?(name)
      end
    end

    delegate :background_color, :login_box_position, :background_size, :logo_alt_text,
             to: :design_setting, allow_nil: true
    delegate :magic_link_enabled, :disallow_password_login, :enable_recaptcha, to: :security_setting

    def client_logo
      design_setting&.logo&.url
    end

    def secondary_logo
      design_setting&.secondary_logo&.url
    end

    def background
      design_setting&.background&.url || glint_fallback_background || fallback_background
    end

    def background_overlay
      design_setting&.background_overlay&.url
    end

    def saml_login_allowed
      object.saml_login_allowed?
    end

    def saml_enforced
      object.saml_enforced?
    end

    def saml_domain_enforcement_enabled
      object.saml_setting&.enforce_for_specific_domains? || false
    end

    def require_mobile_number
      object.registration_setting.require_mobile_number
    end

    # Safe for the `Client.new` fallback the layout passes on project-less routes —
    # `project_feature_enabled?` only exists on projects, so those render legacy.
    def glint_ui
      object.respond_to?(:project_feature_enabled?) && object.project_feature_enabled?(:glint_ui)
    end

    def hide_signup
      object.registration_setting.hide_signup
    end

    def privacy_link_text
      privacy_setting&.privacy_link_text
    end

    def privacy_link_url
      privacy_setting&.privacy_link_url
    end

    def enable_privacy_link
      privacy_setting&.enable_privacy_link
    end

    private

    def security_setting
      object.security_setting
    end

    def privacy_setting
      object.privacy_setting
    end

    # Withholding the design setting falls every branding attribute back to platform defaults.
    def design_setting
      object.design_setting unless Settings.features.disable_project_branding
    end

    def fallback_background
      context[:background] unless background_color
    end

    def glint_fallback_background
      context[:glint_background] if glint_ui
    end
  end
end
