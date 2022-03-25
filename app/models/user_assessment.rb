# frozen_string_literal: true

class UserAssessment < ApplicationRecord
  belongs_to :assessment
  belongs_to :campaign
  belongs_to :norm
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessor
  belongs_to :relationship
  belongs_to :users_result, dependent: :destroy
  belongs_to :created_by
  has_one :saville_user_assessment, dependent: :destroy
  has_one :pearson_user_assessment, dependent: :destroy
  has_one :iiht_user_assessment, dependent: :destroy
  has_one :mindmill_credential, through: :users_result
  has_one :project, through: :campaign

  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5 }
  enum completion_reason: { user_completed: 0, time_out_online: 1, time_out_offline: 2 }
  enum manager_nomination_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_nomination
  enum evaluator_nomination_status: { waiting: 0, completed: 1, declined: 2 }, _prefix: :evaluator_nomination
  enum manager_evaluation_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_evaluation

  has_one :threesixty_campaign, through: :campaign
  delegate :saville_assessment_id, :saville?, :pearson_assessment_id,
           :pearson_assessment_language, :pearson?, :iiht?,
           to: :assessment

  scope :sort_by_subject_name_asc, -> { joins(:subject).merge(User.sort_by_full_name_asc) }
  scope :sort_by_subject_name_desc, -> { joins(:subject).merge(User.sort_by_full_name_desc) }

  scope :filter_by_subject_or_assessment, lambda { |query|
    joins(:subject, :assessment).where(
      'users.first_name ILIKE :query OR users.last_name ILIKE :query OR users.email ILIKE :query OR
      assessments.name ILIKE :query',
      query: "%#{query}%"
    )
  }
  scope :actual_by_options, lambda { |options|
    unless options.participants.dig('subject', 'can_evaluate_self')
      where('user_assessments.subject_id != user_assessments.evaluator_id')
    end
  }

  after_commit -> { set_campaign_user_completion_status }, on: %i[create destroy]
  after_commit -> { set_campaign_user_completion_status }, if: proc { status_previously_changed? }, on: %i[update]
  after_commit :send_completion_email, if: proc { status_previously_changed? && completed? }

  before_save :set_default_relationship

  alias result users_result

  def complete!
    update!(status: :completed, completed_at: Time.current)
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filter_by_subject_or_assessment]
  end

  def pearson_assessment_language
    PearsonAssessmentSetting.pearson_assessment_language(pearson_assessment_id, pearson_norm_id)
  end

  def external_user_reports(type)
    external_reports = assessment.reports.select(&:"provider_#{type}?")

    return UserReport.none if external_reports.blank?

    UserReport.where(
      report_id: external_reports.pluck(:id),
      user_id: subject_id,
      campaign_id: campaign_id
    )
  end

  def available_locales
    assessment_locales = assessment.agile.translations.keys if assessment.agile?
    assessment_locales ||= ['en'] + ::Translation.available_translation_for_assessment(assessment.id)
    campaign_assessment_locales = campaign_assessment&.available_locales
    return assessment_locales if campaign_assessment_locales.blank?

    (campaign_assessment_locales & assessment_locales).presence || ['en']
  end

  def norm_data
    { 'id' => norm_id }
  end

  def real_status
    return 'timed_out' if expired? && !completed? && !ineligible? && !interrupted?

    status
  end

  def set_campaign_user_completion_status
    campaign_user = CampaignUser.find_by(user_id: subject_id, campaign_id: campaign_id)
    CampaignUsers::SetCompletionStatus.call!(campaign_user) if campaign_user
  end

  def send_completion_email
    ::Communications::CompletionTypeJob.perform_later(users_result)
  end

  def user
    evaluator
  end

  def user_id
    evaluator_id
  end

  def set_default_relationship
    self.relationship_id = Relationship.self_relationship&.id unless relationship_id
  end

  def self.statuses_count
    statuses.keys.each_with_object({}) { |status, acc| acc[status.to_sym] = 0 }
  end

  def campaign_user
    CampaignUser.find_by(campaign_id: campaign_id, user_id: evaluator_id)
  end

  def campaign_assessment
    CampaignAssessment.find_by(campaign_id: campaign_id, assessment_id: assessment_id)
  end

  def applicable_norm_id
    return norm_id if norm_id

    campaign_assessment&.norm_id
  end

  def applicable_external_norm_id
    campaign_assessment&.external_norm_id || assessment.external_norm_id
  end

  def saville_norm_id
    saville_user_assessment.norm_id
  end

  def pearson_norm_id
    pearson_user_assessment.norm_id
  end

  def user_reports
    UserReport.where(report_id: assessment.report_ids, user_id: subject_id)
  end

  def norm_name
    return pearson_norm_name if assessment.pearson?
    return saville_norm_name if assessment.saville?

    norm&.name
  end

  def log_attribute_for_delete
    slice(:campaign_id, :relationship_id, :subject_id, :evaluator_id, :status, :assessment_id)
  end

  def timed?
    expiry_date.present?
  end

  def expired?
    return false unless expiry_date

    expiry_date < Time.current || campaign_time_over?
  end

  def campaign_time_over?
    campaign_user&.real_expiry_date && campaign_user.real_expiry_date < Time.current
  end

  def extra_time_buffer_expired?
    return false unless expiry_date

    expiry_date.advance(minutes: 5) < Time.current
  end

  private

  def saville_norm_name
    Settings.providers.saville.norms.find { |norm| norm[:id] == saville_user_assessment.norm_id }&.dig(:name)
  end

  def pearson_norm_name
    PearsonAssessmentSetting.pearson_norms(assessment.pearson_assessment_id).
      find { |norm| norm[:id] == pearson_user_assessment.norm_id }&.dig(:name)
  end
end
