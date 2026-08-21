# frozen_string_literal: true

module Administration
  module Projects
    class SamlSettingSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).maybe(:int?)
          required(:enabled).maybe(:bool?)
          required(:enforced).maybe(:bool?)
          required(:enforce_for).maybe(:str?)
          optional(:enforced_domains).maybe(:array?)
          required(:entity_id).maybe(:str?)
          required(:sso_service_url).maybe(:str?)
          required(:cert).maybe(:str?)
          required(:after_signout_url).maybe(:str?)
          required(:assertion_consumer_service_url).filled(:str?)
          required(:issuer).filled(:str?)
          required(:name_identifier_format).filled(:str?)
          optional(:email_pipetext).maybe(:str?)
        end
      end
    end
  end
end
