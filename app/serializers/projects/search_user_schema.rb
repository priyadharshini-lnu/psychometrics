# frozen_string_literal: true

module Projects
  class SearchUserSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:email).filled(:str?)
        required(:first_name).filled(:str?)
        required(:last_name).filled(:str?)
        required(:locale).maybe(:str?)
      end
    end
  end
end
