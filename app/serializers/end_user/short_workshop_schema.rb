# frozen_string_literal: true

module EndUser
  class ShortWorkshopSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).maybe(:int?)
        required(:start_time).maybe(:str?)
        required(:meeting_link).maybe(:str?)
        required(:campaign_assessment_group_id).maybe(:int?)
        required(:attended).maybe(:bool?)
        required(:closed).maybe(:bool?)
      end
    end
  end
end
