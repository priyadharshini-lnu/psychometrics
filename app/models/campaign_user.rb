# frozen_string_literal: true

class CampaignUser < ApplicationRecord
  enum completion_status: { not_started: 0, in_progress: 1, completed: 2 }
  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4 }, _suffix: :campaign

  belongs_to :user
  belongs_to :campaign
  has_one :project, through: :campaign
  has_many :evaluation_results, through: :user
  has_many :user_assessments, through: :user
  has_many :user_reports, through: :user
  has_many :proctoring_sessions, dependent: :destroy

  scope :in_progress, -> { where(completion_status: :in_progress) }
  scope :completed, -> { where(completion_status: :completed) }

  after_commit :compute_and_set_status, if: proc { completion_status_previously_changed? }, on: [:update]

  def compute_and_set_status
    return if campaign.timed? && completion_status != 'completed'

    update_column(:status, completion_status)
  end

  def disabled
    !active
  end

  def campaign_user_assessments
    user_assessments.where(campaign_id: campaign_id)
  end

  def real_status
    return status if !campaign.fixed_time? || expiry_date.nil? || completed_campaign?

    return 'timed_out' if expiry_date && expiry_date < Time.now

    status
  end

  def real_expiry_date
    return [campaign.end_date, expiry_date].min if campaign.end_date && expiry_date

    expiry_date || campaign.end_date
  end
end
