# frozen_string_literal: true

class NominationRequirementSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:str?)
      required(:name).filled(:str?)
      required(:position).filled(:int?)
      required(:subject_conditions).filled(:array?)
      required(:conditions).array do
        hash do
          required(:value).filled(:str?)
          required(:comparator).filled(:str?)
          required(:relationship_id).filled(:int?)
        end
      end
    end
  end
end
