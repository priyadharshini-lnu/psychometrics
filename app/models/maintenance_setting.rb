# frozen_string_literal: true

class MaintenanceSetting < ApplicationRecord
  enum :sub_system, { proctoring: 1 }

  validates :sub_system, uniqueness: true

  def active?
    return false unless maintenance_window_enabled
    return false if start_time.blank? || end_time.blank?

    normalized_tz = TimezoneHelper.normalize(time_zone)
    current_time = Time.current.in_time_zone(normalized_tz)
    current_time.between?(start_time, end_time)
  end
end
