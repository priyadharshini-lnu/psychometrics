# frozen_string_literal: true

module Campaigns
  module CampaignOptions
    class Form < Rectify::Form
      attribute :campaign_id, Integer
      attribute :time_zone, String
      attribute :fixed_time, Hash[String => Boolean]
      attribute :fixed_time_duration, Integer
      attribute :instructions_enabled, Hash[String => Boolean]
      attribute :instructions, String

      validates :campaign_id, presence: true
      validates :fixed_time_duration, numericality: { only_integer: true }, allow_nil: true
      validates :time_zone, inclusion: { in: ActiveSupport::TimeZone::MAPPING.values }, allow_nil: true
    end
  end
end
