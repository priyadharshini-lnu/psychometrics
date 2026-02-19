# frozen_string_literal: true

class MaintenanceSettingsSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = true

      required(:id).filled(:integer)
      required(:sub_system).filled(:string, included_in?: %w[proctoring])
      required(:maintenance_window_enabled).filled(:bool)
      required(:start_time).maybe(:string)
      required(:end_time).maybe(:string)
      required(:time_zone).maybe(:string)
      required(:active).filled(:bool)
      required(:maintenance_duration).filled(:number)
    end
  end
end
