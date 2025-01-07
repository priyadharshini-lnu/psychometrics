# frozen_string_literal: true

class QuestionSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:name).filled(:str?)
      required(:type).filled(:str?)
      required(:position).filled(:int?)
      required(:props).maybe(:hash?)
      required(:deleted).filled(:bool?)
      required(:created_at).maybe(:str?)
      required(:validation).maybe(:hash?)
      required(:required_validation).maybe(:hash?)
      required(:display_logic).maybe(:hash?)
      required(:skip_logic).maybe(:array?)
      required(:template_id).maybe(:int?)
      required(:assessment_id).maybe(:int?)
    end
  end
end
