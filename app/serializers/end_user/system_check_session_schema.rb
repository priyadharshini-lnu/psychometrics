# frozen_string_literal: true

class EndUser::SystemCheckSessionSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:user_id).filled(:int?)
      required(:created_at).filled(:str?)
      optional(:finished_at).maybe(:str?)
      required(:in_progress).filled(:bool?)
      required(:completed).filled(:bool?)
    end
  end
end
