# frozen_string_literal: true

module EndUser
  class IdpAIChatMessageSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:role).maybe(:str?)
        required(:content).filled(:str?)
        required(:created_at).filled(:str?)
      end
    end
  end
end
