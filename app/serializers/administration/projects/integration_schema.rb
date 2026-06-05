# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSchema < BaseSchema
      def self.schema(_, _) # rubocop:disable Lint/UnderscorePrefixedVariableName
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:active).filled(:bool?)
          optional(:iiht_integration_details).maybe do
            hash(Administration::Projects::Integrations::IihtIntegrationSchema.schema(_, _))
          end

          optional(:hogan_integration_details).maybe do
            hash(Integrations::HoganIntegrationSchema.schema(_, _))
          end

          optional(:mettl_integration_details).maybe do
            hash(Administration::Projects::Integrations::MettlIntegrationSchema.schema(_, _))
          end

          optional(:skillvue_integration_details).maybe do
            hash(Administration::Projects::Integrations::SkillvueIntegrationSchema.schema(_, _))
          end

          optional(:yoodli_integration_details).maybe do
            hash(Administration::Projects::Integrations::YoodliIntegrationSchema.schema(_, _))
          end

          optional(:microsite_integration_details).maybe do
            hash(Administration::Projects::Integrations::MicrositeIntegrationSchema.schema(_, _))
          end
        end
      end
    end
  end
end
