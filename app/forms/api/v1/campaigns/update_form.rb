# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class UpdateForm < Rectify::Form
        attribute :name, String
        attribute :status, String
        attribute :start_date, DateTime
        attribute :end_date, DateTime
        attribute :fixed_time, Boolean
        attribute :duration, Integer
        attribute :enable_instructions, Boolean
        attribute :instructions, String

        validates :status, inclusion: { in: %w[active closed inactive archived] }, allow_nil: true

        validate :end_date_after_start_date

        def end_date_after_start_date
          if context&.campaign&.start_date && end_date < context.campaign.start_date
            errors.add(:end_date, 'must be after the start date')
          end

          return if end_date.blank? || start_date.blank?

          errors.add(:end_date, 'must be after the start date') if end_date < start_date
        end
      end
    end
  end
end
