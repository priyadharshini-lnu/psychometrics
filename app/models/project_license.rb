# frozen_string_literal: true

class ProjectLicense < ApplicationRecord
  belongs_to :project
  belongs_to :license

  validates :usage_limit, numericality: { greater_than_or_equal_to: 0 }
  validates :used_number, numericality: { greater_than_or_equal_to: 0 }
  validate :used_number_validation

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  def enough_licenses?
    usage_limit > used_number
  end

  private

  def used_number_validation
    errors.add(:used_number, :overused) if used_number > usage_limit
  end
end
