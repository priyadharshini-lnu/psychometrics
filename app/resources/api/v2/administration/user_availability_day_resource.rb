# frozen_string_literal: true

class Api::V2::Administration::UserAvailabilityDayResource < Api::V2::Administration::BaseResource
  attributes :day, :start_time, :end_time
end
