# frozen_string_literal: true

module Auth
  class ProjectConfigSerializer < Panko::Serializer
    attributes :id, :background_color, :login_box_position, :background, :background_overlay, :saml_login_allowed,
               :saml_enforced, :client_logo, :secondary_logo, :primary_color,
               :error_color, :warning_color, :success_color, :info_color, :background_size, :require_mobile_number,
               :hide_signup, :magic_link_enabled, :disallow_password_login, :logo_alt_text,
               :enable_recaptcha

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
      design_setting&.background&.url || fallback_background
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

    def require_mobile_number
      object.registration_setting.require_mobile_number
    end

    def hide_signup
      object.registration_setting.hide_signup
    end

    private

    def security_setting
      object.security_setting
    end

    # Withholding the design setting falls every branding attribute back to platform defaults.
    def design_setting
      object.design_setting unless Settings.features.disable_project_branding
    end

    def fallback_background
      context[:background] unless background_color
    end
  end
end
