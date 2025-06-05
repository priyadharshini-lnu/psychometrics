# frozen_string_literal: true

module EndUser
  class AvailableDevelopmentActionSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:description).filled(:str?)
        required(:development_action_type).filled(:str?)
        required(:learning_style).filled(:str?)
        required(:image).maybe(:str?)
      end
    end
  end
end
