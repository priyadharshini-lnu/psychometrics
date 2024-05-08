# frozen_string_literal: true

class BreadcrumbSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      optional(:client).schema do
        required(:id).filled(:int?)
        required(:name).filled(:str?)
      end
      optional(:project).schema do
        required(:id).filled(:int?)
        required(:name).filled(:str?)
      end
      optional(:campaign).schema do
        required(:id).filled(:int?)
        required(:name).filled(:str?)
      end
      optional(:threesixty).schema do
        required(:id).filled(:int?)
        required(:name).filled(:str?)
      end
    end
  end
end
