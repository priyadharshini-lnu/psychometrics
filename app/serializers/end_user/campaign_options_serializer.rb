# frozen_string_literal: true

module EndUser
  class CampaignOptionsSerializer < Panko::Serializer
    attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions_enabled, :instructions,
               :proctoring_enabled, :identification, :rules, :integration_type,
               :workshop_booking_requires_prework_completion

    def proctoring_enabled
      Settings.features.proctoring && object.proctoring_enabled
    end
  end
end
