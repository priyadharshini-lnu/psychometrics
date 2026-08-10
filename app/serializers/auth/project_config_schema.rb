# frozen_string_literal: true

module Auth
  class ProjectConfigSchema < BaseSchema
    OPTIONAL_STRING_KEYS = %i[
      background_color login_box_position background background_overlay client_logo secondary_logo
      primary_color error_color warning_color success_color info_color background_size logo_alt_text
      external_logout_url
    ].freeze

    OPTIONAL_BOOLEAN_KEYS = %i[
      saml_login_allowed saml_enforced require_mobile_number disallow_password_login magic_link_enabled
      enable_recaptcha external_logout_redirect_enabled glint_ui
    ].freeze

    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:hide_signup).filled(:bool?)

        OPTIONAL_STRING_KEYS.each { |key| required(key).maybe(:str?) }
        OPTIONAL_BOOLEAN_KEYS.each { |key| required(key).maybe(:bool?) }
      end
    end
  end
end
