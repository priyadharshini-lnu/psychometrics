# frozen_string_literal: true

module Licenses
  class CreateForm < Rectify::Form
    attribute :start_date, String
    attribute :end_date, String
    attribute :overuse_number, Integer
    attribute :number, Integer
    attribute :report_family_id, Integer
    attribute :client_id, Integer
    attribute :type

    validates :client_id, :start_date, :end_date, presence: true, allow_nil: false
    validates :overuse_number, numericality: { greater_than_or_equal_to: 0 }
    validates :number, numericality: { greater_than_or_equal_to: 1 }
    validates :report_family_id, presence: true, unless: -> { type == :proctoring }
    validate :license_expire_validation, if: -> { end_date && start_date }

    def license_expire_validation
      if end_date && start_date && (end_date <= start_date)
        errors.add(:end_date, :invalid)
      end
    end
  end
end
