# frozen_string_literal: true

module Administration
  class ReportFamilySchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:reports).array do
          hash do
            required(:id).filled(:int?)
            required(:name).filled(:str?)
          end
        end
      end
    end
  end
end
