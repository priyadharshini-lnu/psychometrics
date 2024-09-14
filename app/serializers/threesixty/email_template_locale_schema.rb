# frozen_string_literal: true

module Threesixty
  class EmailTemplateLocaleSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:locale).filled(:str?)
        required(:subject).filled(:str?)
        required(:content).filled(:str?)
      end
    end
  end
end
