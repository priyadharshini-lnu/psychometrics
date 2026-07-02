# frozen_string_literal: true

module Auth
  class ClientConfigSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:background_color).maybe(:str?)
        required(:login_box_position).maybe(:str?)
        required(:background).maybe(:str?)
        required(:background_overlay).maybe(:str?)
        required(:saml_login_allowed).maybe(:bool?)
        required(:saml_enforced).maybe(:bool?)
        required(:client_logo).maybe(:str?)
        required(:secondary_logo).maybe(:str?)
        required(:primary_color).maybe(:str?)
        required(:error_color).maybe(:str?)
        required(:warning_color).maybe(:str?)
        required(:success_color).maybe(:str?)
        required(:info_color).maybe(:str?)
        required(:background_size).maybe(:str?)
        required(:logo_alt_text).maybe(:str?)
      end
    end
  end
end
