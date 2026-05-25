# frozen_string_literal: true

class CampaignUser < ApplicationRecord
  audited

  enum :completion_status, { not_started: 0, in_progress: 1, completed: 2 }
  enum :status, { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4 }, suffix: :campaign

  belongs_to :user
  belongs_to :campaign
  belongs_to :current_job_role, class_name: 'JobRole', optional: true
  belongs_to :target_job_role, class_name: 'JobRole', optional: true
  include Tenantable

  has_one :project, through: :campaign
  has_many :campaign_assessments, through: :campaign
  has_many :evaluation_results, through: :user
  has_many :user_assessments, through: :user
  has_many :assessments, through: :user_assessments
  has_many :user_reports, through: :user
  has_many :reports, through: :user_reports
  include CampaignUsers::Proctoring

  has_many :workshop_subjects,
           ->(campaign_user) { where(campaign_id: campaign_user.campaign_id) },
           foreign_key: :user_id, primary_key: :user_id
  has_many :workshop_invited_subjects,
           lambda { |campaign_user|
             joins(:workshop_invite).
               where(workshop_invites: { campaign_id: campaign_user.campaign_id })
           },
           foreign_key: :user_id, primary_key: :user_id
  has_many :campaign_factors, through: :campaign
  has_many :campaign_ai_artifacts, through: :campaign
  has_many :communication_emails

  validates :external_id, uniqueness: { scope: :campaign_id }, allow_nil: true
  validate :ensure_job_roles_are_different

  scope :in_progress, -> { where(completion_status: :in_progress) }
  scope :completed, -> { where(completion_status: :completed) }

  after_commit :compute_and_set_status, if: proc { completion_status_previously_changed? }, on: [:update]
  after_commit :finish_proctoring_session,
               if: proc { status_previously_changed? && %w[completed timed_out].include?(status) },
               on: [:update]
  after_commit :generate_or_remove_report_on_score_finalized,
               if: proc { campaign_scores_finalized_previously_changed? },
               on: [:update]
  after_commit :generate_or_remove_report_on_artifact_results_finalized,
               if: proc { campaign_artifact_results_finalized_previously_changed? },
               on: [:update]
  after_commit :publish_campaign_results_available,
               if: proc { campaign_scores_finalized_previously_changed? && campaign_scores_finalized? },
                on: [:update]
  after_commit :publish_campaign_user_status,
               if: proc { status_previously_changed? || saved_change_to_id? },
               on: %i[create update]

  delegate :proctoring_enabled?, :proctoring_enabled_on_workshop_activity?, :enable_mobile_proctoring?, to: :campaign
  delegate :pending_assessments, to: :user_assessments

  enum :level, { apply: 0, guide: 1, shape: 2 }

  def campaign_factor_values
    CampaignFactorValue.where(campaign_id: campaign_id, user_id: user_id)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id active status completion_status started_at completed_at]
  end

  def publish_campaign_user_status
    CampaignUsers::Webhook.new(self).publish_campaign_user_status
  end

  def generate_or_remove_report_on_score_finalized
    if campaign_scores_finalized?
      UserReports::GenerateAndSavePdfJob.set(wait: 30.seconds).perform_later(
        campaign_factor_dependent_user_reports.pluck(:id), user
      )
    else
      UserReports::RemovePdfJob.perform_later(campaign_factor_dependent_user_reports.pluck(:id))
    end
  end

  def publish_campaign_results_available
    CampaignUsers::Webhook.new(self).publish_campaign_results_available
  end

  def campaign_factor_dependent_user_reports
    UserReport.joins(:report).merge(Report.campaign_factor_dependable).
      where(campaign_id: campaign_id, user_id: user_id)
  end

  def generate_or_remove_report_on_artifact_results_finalized
    if campaign_artifact_results_finalized?
      UserReports::GenerateAndSavePdfJob.set(wait: 30.seconds).perform_later(
        campaign_ai_artifact_dependent_user_reports.pluck(:id), user
      )
    else
      UserReports::RemovePdfJob.perform_later(campaign_ai_artifact_dependent_user_reports.pluck(:id))
    end
  end

  def campaign_ai_artifact_dependent_user_reports
    UserReport.joins(:report).
      merge(Report.campaign_ai_artifact_dependable).
      where(campaign_id: campaign_id, user_id: user_id)
  end

  def compute_and_set_status
    return if campaign.fixed_timed? && completion_status != 'completed'
    return if campaign.fixed_timed? && started_at.nil?

    update(status: completion_status)
  end

  def compute_expiry_date
    return unless campaign.fixed_time?

    dates = []
    dates << if interrupted_campaign?
               additional_time&.seconds&.from_now
             elsif expiry_date.nil? || not_started_campaign?
               campaign.fixed_time_duration&.seconds&.from_now
             else
               expiry_date
             end
    dates << schedule_end_date
    dates.compact.min
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

  def prework_assessment_ids
    campaign_user_assessments.preworks(true).pluck(:assessment_id)
  end

  def prework_user_assessments
    campaign_user_assessments.preworks(true).self_assessment
  end

  def all_prework_completed?
    !prework_user_assessments.pending_assessments.exists?
  end

  def workshop_assessment_ids
    campaign_assessments.workshop_activities.pluck(:assessment_id)
  end

  def scheduled_at
    dates = []
    dates << campaign.start_date if campaign.inactive? && campaign.start_date
    dates << schedule_start_date if schedule_start_date
    dates.max
  end

  def scheduled_in
    return unless scheduled_at

    scheduled_at - Time.zone.now
  end

  def schedule_started?
    return true unless schedule_start_date

    schedule_start_date < Time.zone.now
  end

  def schedule_ended?
    schedule_end_date && schedule_end_date < Time.zone.now
  end

  def in_schedule?
    schedule_started? && !schedule_ended?
  end

  def all_preworks_completed?
    user_preworks_count = Campaigns::GetPreworks.call!(campaign_id, user_id)[user_id]
    return true unless user_preworks_count

    user_preworks_count['completed'] == user_preworks_count['total']
  end

  def all_campaign_scores_present?
    CampaignFactorValue.where(campaign_id: campaign_id, user_id: user_id).count == campaign_factors.count
  end

  def all_campaign_artifact_results_present?
    ::AI::CampaignArtifactResult.joins(:campaign_ai_artifact).
      where(
        campaign_ai_artifacts: { campaign_id: campaign_id },
        user_id: user_id,
        error: nil
      ).where.not(checkpoint: nil).count == campaign_ai_artifacts.count
  end

  private

  def ensure_job_roles_are_different
    return if current_job_role_id.blank? || target_job_role_id.blank?

    if current_job_role_id == target_job_role_id
      errors.add(:base, I18n.t('admin.campaign_user_job_roles_cannot_be_same'))
    end
  end
end
