# frozen_string_literal: true

class MaintenanceSettingsSerializer < Panko::Serializer
  attributes :sub_system, :maintenance_window_enabled, :start_time, :end_time, :time_zone, :active,
             :maintenance_duration

  def active
    object.active?
  end

  def maintenance_duration
    return 0 unless object.maintenance_window_enabled
    return 0 if object.start_time.blank? || object.end_time.blank?

    ((object.end_time - object.start_time) / 60).to_i
  end
end
