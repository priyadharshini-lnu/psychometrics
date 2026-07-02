# frozen_string_literal: true

module Auth
  class ClientConfigSerializer < Panko::Serializer
    attributes :background_color, :login_box_position, :background, :background_overlay,
               :client_logo, :secondary_logo, :logo_alt_text, :primary_color,
               :error_color, :warning_color, :success_color, :info_color, :background_size,
               :saml_login_allowed, :saml_enforced

    DELEGATE_METHODS = %i[primary_color error_color warning_color success_color info_color].freeze

    DELEGATE_METHODS.each do |name|
      define_method name do
        design_setting&.send(name)
      end
    end

    delegate :background_color, :login_box_position, :background_size, :logo_alt_text,
             to: :design_setting, allow_nil: true

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
      object.client_sso_setting&.saml_login_allowed? || false
    end

    def saml_enforced
      object.client_sso_setting&.saml_enforced? || false
    end

    private

    def design_setting
      object.design_setting
    end

    def fallback_background
      context[:background] unless background_color
    end
  end
end
