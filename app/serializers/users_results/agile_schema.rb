# frozen_string_literal: true

module UsersResults
  class AgileSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:groups).value { array? | hash? | nil? }
        required(:locale).maybe(:hash?)
        required(:completed_groups).value { array? | hash? | nil? }
        required(:assets).filled(:hash?)
        required(:available_locales).filled(:array?).each(:str?)
        required(:other_pending_assessments_count).filled(:int?)
        required(:remaining_campaign_time).maybe(:str?)
      end
    end
  end
end
