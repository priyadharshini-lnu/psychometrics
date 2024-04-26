# frozen_string_literal: true

module Campaigns
  class Form < Rectify::Form
    attribute :name, String
    attribute :status, String
    attribute :options, Hash
    attribute :type, String, default: :common
    attribute :start_date, DateTime
    attribute :end_date, DateTime
    attribute :practice_campaign, Boolean, default: false

    validates :name, :status, presence: true
    validate :end_date_after_start_date

    def end_date_after_start_date
      return if end_date.blank? || start_date.blank?

      errors.add(:end_date, I18n.t('administration.campaigns.validations.dates.end')) if end_date < start_date
    end
  end
end
