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

  after_commit :set_status_to_completed, if: proc { completion_status_previously_changed? && completed? }, on: [:update]

  def set_status_to_completed
    update_column(:status, :completed)
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
end
