# frozen_string_literal: true

module Campaigns
  class Form < Rectify::Form
    attribute :name, String
    attribute :status, String
    attribute :options, Hash
    attribute :type, String, default: :common
    attribute :start_date, DateTime
    attribute :end_date, DateTime

    validates :name, :status, presence: true
    validate :end_date_after_start_date

    def end_date_after_start_date
      return if end_date.blank? || start_date.blank?

      errors.add(:end_date, 'must be after the start date') if end_date < start_date
    end
  end
end
