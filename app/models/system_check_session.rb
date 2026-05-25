# frozen_string_literal: true

class SystemCheckSession < ApplicationRecord
  belongs_to :user
  include Tenantable

  tenant_source :user
  has_many :system_check_records, dependent: :destroy

  validates :user_id, presence: true

  scope :in_progress, -> { where(finished_at: nil) }
  scope :completed, -> { where.not(finished_at: nil) }

  def in_progress?
    finished_at.blank?
  end

  def completed?
    finished_at.present?
  end

  def valid_for_campaign?(campaign)
    return false unless completed?

    validity_seconds = campaign.system_check_validity
    return true if validity_seconds.blank?

    finished_at > validity_seconds.seconds.ago
  end

  def finish!
    update!(finished_at: Time.zone.now)
  end

  def latest_records_by_check_type
    system_check_records.
      order(created_at: :desc).
      group_by(&:check_type).
      transform_values(&:first)
  end
end
