# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class UserAssessment < ApplicationRecord
  audited
  DEEMED_COMPLETED_STATUS = %w[completed ineligible].freeze
  MAX_RESET_COUNT = 3

  belongs_to :assessment
  belongs_to :campaign
  belongs_to :norm
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessor, primary_key: :user_id, foreign_key: :evaluator_id
  belongs_to :relationship
  belongs_to :users_result, dependent: :destroy
  belongs_to :created_by

  has_one :saville_user_assessment, dependent: :destroy
  has_one :pearson_user_assessment, dependent: :destroy
  has_one :iiht_user_assessment, dependent: :destroy
  has_one :mettl_user_assessment, dependent: :destroy
  has_one :project, through: :campaign
  has_one :meeting_room, as: :meetable, dependent: :destroy
  has_one :threesixty_campaign, through: :campaign
  has_many :project_assessments, through: :project
  has_many :user_assessment_factor_scores, dependent: :destroy
  has_many :user_assessment_verification_images, dependent: :destroy

  enum status: { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5 }
  enum completion_reason: { user_completed: 0, time_out_online: 1, time_out_offline: 2 }
  enum manager_nomination_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_nomination
  enum evaluator_nomination_status: { waiting: 0, completed: 1, declined: 2 }, _prefix: :evaluator_nomination
  enum manager_evaluation_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :manager_evaluation
  enum meeting_type: { not_available: 0, internal: 1, custom: 2 }, _prefix: :meeting

  delegate :saville?, :iiht?, :pearson?, :mettl?, :assessor_form?, :external?, to: :assessment
  delegate :prework?, :prework, :workshop_activity?, :workshop_activity, :workshop_activity_duration,
           to: :campaign_assessment, allow_nil: true
  delegate :normalize_factor_scores?, to: :project_assessment, allow_nil: true

  scope :sort_by_subject_name_asc, -> { joins(:subject).merge(User.sort_by_full_name_asc) }
  scope :sort_by_subject_name_desc, -> { joins(:subject).merge(User.sort_by_full_name_desc) }
  scope :self_assessment, -> { where('subject_id = evaluator_id') }
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
  scope :pending_assessments, -> { where.not(status: %i[completed timed_out ineligible]) }
  scope :with_campaign_assessments, lambda {
    joins(
      'LEFT JOIN
        campaign_assessments ON campaign_assessments.assessment_id = user_assessments.assessment_id
        AND
        campaign_assessments.campaign_id = user_assessments.campaign_id'
    )
  }
  scope :with_workshop_activities, lambda {
    where('campaign_assessments.workshop_activity = TRUE OR user_assessments.relationship_id = ?',
          Relationship.assessor_relationship)
  }
  scope :user_workshop_activities, lambda { |user_id|
    with_campaign_assessments.
      where(user_assessments: { evaluator_id: user_id }).
      merge(CampaignAssessment.workshop_activities)
  }

  scope :workshop_activities, lambda { |value|
    with_campaign_assessments.where(campaign_assessments: { workshop_activity: value })
  }

  scope :preworks, lambda { |value|
    with_campaign_assessments.where(campaign_assessments: { prework: value })
  }
  scope :pending_assessments, lambda {
    where('subject_id = evaluator_id').where.not(status: %i[completed timed_out ineligible])
  }

  scope :scored, -> { where(status: :completed, score_calculated: true) }
  scope :deemed_completed, -> { where(status: DEEMED_COMPLETED_STATUS) }
  scope :deemed_incomplete, -> { where.not(status: DEEMED_COMPLETED_STATUS) }

  before_save :set_default_relationship
  after_save -> { create_meeting_room! }, if: -> { meeting_internal? && meeting_room.blank? }
  after_commit -> { set_campaign_user_completion_status }, on: %i[create destroy]
  after_commit -> { set_campaign_user_completion_status }, if: proc { status_previously_changed? }, on: %i[update]
  after_commit :send_completion_email, if: proc { status_previously_changed? && (completed? || ineligible?) }

  after_commit -> { set_campaign_user_started_at }, unless: :not_started?, on: %i[create]
  after_commit -> { set_campaign_user_started_at }, if: proc {
                                                          status_previously_changed? && in_progress?
                                                        }, on: %i[update]
  after_commit -> { sync_assessor_form_status_to_subject_meeting },
               if: proc { status_previously_changed? }, on: %i[update]

  after_commit -> { calculate_and_save_campaign_scoring },
               if: proc { score_calculated_previously_changed? && completed? }, on: %i[update]

  alias result users_result

  def calculate_and_save_campaign_scoring
    return unless CampaignUser.exists?(campaign_id: campaign_id, user_id: subject_id)

    # TODO: Investigate why users_result.scoring is nil if we don't add delay of 30 seconds
    CampaignScoring::CalculateAndSaveJob.set(wait: 30.seconds).perform_later(campaign, subject)
  end

  def sync_assessor_form_status_to_subject_meeting
    subject_user_assessment = linked_subject_user_assessment
    return if subject_user_assessment.nil? || !subject_user_assessment.assessment.meeting?

    subject_user_assessment.update!(status: status)
  end

  def set_campaign_user_started_at
    return unless campaign_user
    return if campaign_user.started_at.present? || campaign.fixed_timed?

    campaign_user.update!(started_at: Time.current)
  end

  def real_meeting_link(user)
    if meeting_internal? && meeting_room.present?
      route = user.admin? ? :admin_meeting_url : :meeting_url
      Utility::Url.generate(route, room_id: meeting_room.id, subdomain: user.subdomain)
    elsif meeting_custom?
      meeting_link
    end
  end

  def complete!
    update!(status: :completed, completed_at: Time.current)
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filter_by_subject_or_assessment preworks workshop_activities]
  end

  def saville_norm_id
    saville_user_assessment.norm_id
  end

  def pearson_norm_id
    pearson_user_assessment.norm_id
  end

  def pearson_assessment_language
    pearson_assessment = PearsonAssessment.find_by(product_id: assessment.external_settings[:assessment_id])
    return unless pearson_assessment

    pearson_assessment.norms['items'].find do |norm|
      norm['normId'] == pearson_norm_id
    end['supportedLanguage']
  end

  def user_reports(type = nil)
    report_ids = type ? assessment.reports.select(&:"provider_#{type}?").map(&:id) : assessment.report_ids

    return UserReport.none if report_ids.blank?

    UserReport.where(
      report_id: report_ids,
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
    ::Communications::CompletionTypeJob.perform_later(self)
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
    @campaign_user ||= CampaignUser.find_by(campaign_id: campaign_id, user_id: evaluator_id)
  end

  def campaign_assessment
    @campaign_assessment ||= CampaignAssessment.find_by(campaign_id: campaign_id, assessment_id: assessment_id)
  end

  def applicable_norm_id
    return norm_id if norm_id

    campaign_assessment&.norm_id
  end

  def applicable_external_norm_id
    campaign_assessment&.external_norm_id || assessment.external_settings[:norm_id]
  end

  def norm_name
    return pearson_norm_name if assessment.pearson?
    return saville_norm_name if assessment.saville?
    return hogan_norm_name if assessment.hogan?

    norm&.name
  end

  def log_attributes
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

  def other_pending_assessments_count
    return 0 if campaign_user.nil? || campaign.threesixty?

    campaign_user.campaign_user_assessments.pending_assessments.where.not(id: id).count
  end

  def self_assessment?
    subject_id == evaluator_id
  end

  def closed?
    return true if %w[completed timed_out ineligible].include?(status)
    return true if self_assessment? && %w[closed inactive archived].include?(campaign.status)
    return false unless campaign_user

    !campaign_user.in_schedule?
  end

  def linked_assessor_user_assessment
    return @linked_assessor_user_assessment if defined? @linked_assessor_user_assessment

    assessor_form = assessment.linked_assessor_form
    return unless assessor_form

    @linked_assessor_user_assessment = UserAssessment.find_by(
      campaign_id: campaign_id, assessment_id: assessor_form.id, subject_id: subject_id,
      relationship: Relationship.assessor_relationship
    )
  end

  def linked_subject_user_assessment
    return @linked_subject_user_assessment if defined? @linked_subject_user_assessment

    subject_assessment = assessment&.linked_assessment
    return unless subject_assessment

    @linked_subject_user_assessment = UserAssessment.find_by(
      campaign_id: campaign_id, assessment_id: subject_assessment.id, subject_id: subject_id, evaluator_id: subject_id,
      relationship: Relationship.self_relationship
    )
  end

  def deemed_completed?
    DEEMED_COMPLETED_STATUS.include?(status)
  end

  def update_norm!(norm_id)
    return if completed? && norm_id.blank?

    if saville?
      saville_user_assessment.update!(norm_id: norm_id)
    elsif pearson?
      return unless not_started?

      pearson_user_assessment.update!(norm_id: norm_id)
    else
      update!(norm_id: norm_id)
    end
    update!(fixed_norm: true) if norm_id.present?
  end

  def project_assessment
    project_assessments.find_by(assessment_id: assessment_id)
  end

  def update_mettl_schedule!(mettl_schedule_record_id)
    return unless not_started?
    return unless mettl?

    mettl_user_assessment.update!(mettl_schedule_record_id: mettl_schedule_record_id)
  end

  private

  def saville_norm_name
    Settings.providers.saville.norms.
      find { |norm| norm[:id] == saville_user_assessment.norm_id }&.dig(:name)
  end

  def pearson_norm_name
    Assessments::PearsonSettings.norms(assessment.external_assessment_id, pearson_user_assessment.norm_id)&.
      find { |norm| norm[:id] == pearson_user_assessment.norm_id }&.dig(:name)
  end

  def hogan_norm_name
    user&.hogan_credential&.norm
  end
end
# rubocop:enable Metrics/ClassLength
