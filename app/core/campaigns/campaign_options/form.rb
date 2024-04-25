# frozen_string_literal: true

module Campaigns
  module CampaignOptions
    class Form < Rectify::Form
      attribute :campaign_id, Integer
      attribute :time_zone, String
      attribute :fixed_time, { String => Boolean }
      attribute :fixed_time_duration, Integer
      attribute :instructions_enabled, { String => Boolean }
      attribute :instructions, String
      attribute :identification, Integer
      attribute :integration_type, String
      attribute :proctoring_enabled, { String => Boolean }
      attribute :proctoring_trial, { String => Boolean }
      attribute :proctoring_type, String
      attribute :rules, Hash
      attribute :description, String

      validates :campaign_id, presence: true
      validates :fixed_time_duration, numericality: { only_integer: true }, allow_nil: true
      validates :description, length: { maximum: 500 }

      validate :time_zone do
        unless time_zone.nil? || ActiveSupport::TimeZone[time_zone]
          errors.add(:time_zone, :invalid)
        end
      end
    end
  end
end
