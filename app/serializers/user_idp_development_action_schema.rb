# frozen_string_literal: true

class UserIdpDevelopmentActionSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true
      required(:custom_action_learning_style).filled(:str?)
      required(:custom_action).filled(:str?)
      required(:start_date_time).filled(:str?)
      required(:end_date_time).filled(:str?)
      required(:progress).filled(:int?)
      required(:learning_style).filled(:str?)
      required(:type).filled(:str?)
    end
  end
end
