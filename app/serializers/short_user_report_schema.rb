# frozen_string_literal: true

class ShortUserReportSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:int?)
      required(:status).filled(:str?)
      required(:campaign_id).filled(:int?)
      required(:project_id).filled(:int?)
      required(:poster).maybe(:str?)
      required(:name).filled(:str?)
      required(:report_id).filled(:int?)
      required(:external_report).filled(:bool?)
    end
  end
end
