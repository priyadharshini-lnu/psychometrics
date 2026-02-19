# frozen_string_literal: true

class Api::V2::Administration::MaintenanceSettingResource < Api::V2::Administration::BaseResource
  attributes :id, :sub_system, :maintenance_window_enabled, :time_zone, :start_time, :end_time
end
