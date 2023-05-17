# frozen_string_literal: true

class CampaignUser < ApplicationRecord
  enum completion_status: { not_started: 0, in_progress: 1, completed: 2 }
  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4 }, _suffix: :campaign

  belongs_to :user
  belongs_to :campaign
  has_one :project, through: :campaign
  has_many :campaign_assessments, through: :campaign
  has_many :evaluation_results, through: :user
  has_many :user_assessments, through: :user
  has_many :assessments, through: :user_assessments
  has_many :user_reports, through: :user
  has_many :reports, through: :user_reports
  has_many :proctoring_sessions, dependent: :destroy

  scope :in_progress, -> { where(completion_status: :in_progress) }
  scope :completed, -> { where(completion_status: :completed) }

  after_commit :compute_and_set_status, if: proc { completion_status_previously_changed? }, on: [:update]
  after_commit :finish_proctoring_session,
               if: proc { status_previously_changed? && %w[completed timed_out].include?(status) },
               on: [:update]
  delegate :proctoring_enabled?, to: :campaign
  delegate :pending_assessments, to: :user_assessments

  def compute_and_set_status
    return if campaign.fixed_timed? && completion_status != 'completed'

    update(status: completion_status)
  end

  def compute_expiry_date
    return unless campaign.fixed_time?

    if expiry_date.nil? || not_started_campaign?
      campaign.fixed_time_duration&.seconds&.from_now
    elsif interrupted_campaign?
      additional_time&.seconds&.from_now
    else
      expiry_date
    end
  end

  def finish_proctoring_session
    proctoring_session = proctoring_sessions.last
    return unless proctoring_session

    Examus::FinishSession.call!(proctoring_session.session_id)
  end

  def disabled
    !active
  end

  def campaign_user_assessments
    user_assessments.where(campaign_id: campaign_id)
  end

  def campaign_user_reports
    user_reports.where(campaign_id: campaign_id)
  end

  def real_status
    return status if !campaign.fixed_time? || expiry_date.nil? || completed_campaign?

    return 'timed_out' if expiry_date && expiry_date < Time.zone.now

    status
  end

  def real_expiry_date
    return campaign.end_date unless campaign.fixed_time?
    return [campaign.end_date, expiry_date].min if campaign.end_date && expiry_date

    expiry_date || campaign.end_date
  end

  def remaining_campaign_time
    return unless real_expiry_date

    [real_expiry_date - Time.zone.now, 0].max
  end

  def prework_user_assessments
    assessment_ids = campaign_assessments.preworks.pluck(:assessment_id)
    campaign_user_assessments.self_assessment.where(assessment_id: assessment_ids)
  end

  def all_prework_completed?
    !prework_user_assessments.pending_assessments.exists?
  end
end
