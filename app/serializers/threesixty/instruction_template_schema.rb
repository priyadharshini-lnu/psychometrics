# frozen_string_literal: true

module Threesixty
  class InstructionTemplateSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:content).filled(:str?)
        required(:enabled).filled(:bool?)
      end
    end
  end
end
