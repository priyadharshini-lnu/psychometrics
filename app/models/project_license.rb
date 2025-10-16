# frozen_string_literal: true

class ProjectLicense < ApplicationRecord
  belongs_to :project
  belongs_to :license

  validates :usage_limit, numericality: { greater_than_or_equal_to: 0 }
  validates :used_number, numericality: { greater_than_or_equal_to: 0 }
  validate :used_number_validation
  validate :cannot_allot_more_than_available

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  def enough_licenses?
    usage_limit > used_number
  end

  private

  def used_number_validation
    errors.add(:used_number, :overused) if used_number > usage_limit
  end

  def cannot_allot_more_than_available
    if usage_limit > license.number
      raise Licenses::NotEnoughError,
            I18n.t('activerecord.errors.models.project_license.attributes.base.exceeds_available')
    end
  end
end
