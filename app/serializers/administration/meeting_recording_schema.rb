# frozen_string_literal: true

module Administration
  class MeetingRecordingSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:external_id).maybe(:str?)
        required(:recording_date).maybe(:date?)
        required(:recording_url).maybe(:str?)
        required(:assessors).maybe(:array?)
        required(:participants).maybe(:array?)
        required(:assessment_center_date_and_time).maybe(:str?)
      end
    end
  end
end
