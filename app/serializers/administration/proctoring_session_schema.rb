# frozen_string_literal: true

module Administration
  class ProctoringSessionSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:session_id).filled(:str?)
        required(:started_at).filled(:str?)
        required(:completed_at).maybe(:str?)
        required(:score).maybe(:int?)
        required(:comment).maybe(:str?)
        required(:archive_url).maybe(:str?)
        required(:report_url).maybe(:str?)
        required(:conclusion).maybe(:str?)
        required(:assessment_name).maybe(:str?)
      end
    end
  end
end
