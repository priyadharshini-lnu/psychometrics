# frozen_string_literal: true

class MediaResponseSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:user_selected).filled(:bool?)
      required(:filename).maybe(:str?)
      required(:question_id).filled(:int?)
      required(:url).maybe(:str?)
      required(:created_at) { str? | time? }
    end
  end
end
