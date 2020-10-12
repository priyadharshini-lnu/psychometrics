# frozen_string_literal: true

module EndUser
  class CampaignOptionsSerializer < ActiveModel::Serializer
    attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions_enabled, :instructions
  end
end
