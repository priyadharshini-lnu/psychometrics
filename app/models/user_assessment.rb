# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class UserAssessment < ApplicationRecord
  audited

  include HoganResource
  include EncodableId

  DEEMED_COMPLETED_STATUS = %w[completed timed_out ineligible].freeze
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
  include Tenantable

  belongs_to :campaign_user, primary_key: :user_id, foreign_key: :evaluator_id, class_name: 'CampaignUser'

  has_one :saville_user_assessment, dependent: :destroy
  has_one :pearson_user_assessment, dependent: :destroy
  has_one :iiht_user_assessment, dependent: :destroy
  has_one :mettl_user_assessment, dependent: :destroy
  has_one :simulation_user_assessment, dependent: :destroy
  has_one :skillvue_user_assessment, dependent: :destroy
  has_one :microsite_user_assessment, dependent: :destroy
  has_one :project, through: :campaign
  has_one :client, through: :project
  has_one :meeting_room, as: :meetable, dependent: :destroy
  has_one :threesixty_campaign, through: :campaign
  has_many :project_assessments, through: :project
  has_many :user_assessment_factor_scores, dependent: :destroy
  has_many :user_assessment_verification_images, dependent: :destroy
  has_many :user_assessment_verification_media, dependent: :destroy,
                                               class_name: 'UserAssessmentVerificationMedium'

  has_one :yoodli_user_assessment, -> { where(active: true) }, dependent: :destroy
  has_many :previous_yoodli_user_assessments, lambda {
    where(active: false)
  }, class_name: 'YoodliUserAssessment', dependent: :destroy

  has_many :proctoring_sessions, dependent: :destroy

  has_one :mhs_user_assessment, -> { where(active: true) }, dependent: :destroy
  has_many :previous_mhs_user_assessments, lambda {
    where(active: false)
  }, class_name: 'MhsUserAssessment', dependent: :destroy

  enum :status, { not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5 }
  enum :completion_reason, { user_completed: 0, time_out_online: 1, time_out_offline: 2 }
  enum :manager_nomination_status, { waiting: 0, approved: 1, denied: 2 }, prefix: :manager_nomination
  enum :evaluator_nomination_status, { waiting: 0, completed: 1, declined: 2 }, prefix: :evaluator_nomination
  enum :manager_evaluation_status, { waiting: 0, approved: 1, denied: 2 }, prefix: :manager_evaluation
  enum :meeting_type, { not_available: 0, internal: 1, custom: 2 }, prefix: :meeting

  delegate :saville?, :iiht?, :pearson?, :mettl?, :simulation?, :hogan?, :skillvue?, :yoodli?,
           :mhs?, :microsite?, :assessor_form?,
           :has_ai_questions?,
           :external?, :external_settings, :combined_hogan_assessment?, to: :assessment
  delegate :workshop_activity?, :workshop_activity, :workshop_activity_duration,
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
    where(prework: value)
  }
  scope :pending_assessments, lambda {
    where('subject_id = evaluator_id').where.not(status: %i[completed timed_out ineligible])
  }

  scope :campaign_assessment_group_eq, lambda { |group_id|
    with_campaign_assessments.where(campaign_assessments: { campaign_assessment_group_id: group_id })
  }

  scope :scored, -> { where(status: :completed, score_calculated: true) }
  scope :deemed_completed, -> { where(status: DEEMED_COMPLETED_STATUS) }
  scope :deemed_incomplete, -> { where.not(status: DEEMED_COMPLETED_STATUS) }
  scope :excluding_inactive_campaign_users, lambda {
    joins(
      'INNER JOIN campaign_users ON campaign_users.user_id = user_assessments.subject_id ' \
      'AND campaign_users.campaign_id = user_assessments.campaign_id'
    ).where(campaign_users: { active: true }).distinct
  }

  before_save :set_default_relationship
  after_create :backfill_users_result_tenant_id
  after_destroy :reset_user_report_approval_status

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

  after_commit -> { generate_campaign_scoring_and_artifacts_results },
               if: proc { score_calculated_previously_changed? && completed? }, on: %i[update]

  after_commit :publish_assessment_started_webhook, if: -> { saved_change_to_status == %w[not_started in_progress] }

  after_commit :publish_assessment_timeout_webhook, if: -> { status_previously_changed? && timed_out? }

  after_commit :publish_campaign_user_assessment_summary_webhook,
               if: -> { status_previously_changed? }, on: %i[update]

  after_create_commit -> { publish_assessment_assigned_webhook }
  after_create_commit :trigger_microsite_registration, if: -> { assessment&.microsite? }
  after_commit :send_workshop_invite_email, if: :should_send_workshop_invite_email?, on: %i[update]
  after_commit -> { finish_proctoring_session },
               if: proc { status_previously_changed? && deemed_completed? }, on: %i[update]

  after_commit :enqueue_media_response_transcriptions,
               if: proc { status_previously_changed? && completed? }, on: %i[update]

  alias result users_result

  def self.ransackable_attributes(_auth_object = nil)
    %w[id subject_id campaign_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[campaign_assessment]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filter_by_subject_or_assessment preworks workshop_activities campaign_assessment_group_eq]
  end

  def finish_proctoring_session
    return unless campaign_user

    if campaign.selective_proctoring_enabled?
      return unless proctoring_enabled?

      mark_proctoring_session_completed
    else
      return unless campaign_user.proctoring_enabled?

      campaign_user.finish_proctoring_session if campaign_user.all_proctored_assessments_completed?
    end
  end

  def mark_proctoring_session_completed
    proctoring_session = proctoring_sessions.valid_sessions.where(completed_at: nil).last
    if proctoring_session
      Examus::FinishSession.call!(proctoring_session.session_id)
      proctoring_session.update(completed_at: Time.current)
    end
  end

  def generate_campaign_scoring_and_artifacts_results
    return unless CampaignUser.exists?(campaign_id: campaign_id, user_id: subject_id)

    # TODO: Investigate why users_result.scoring is nil if we don't add delay of 30 seconds
    CampaignResults::ScoringAndArtifactsGeneratorJob.set(wait: 30.seconds).perform_later(campaign, subject)
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
    if meeting_internal? && meeting_room.present? && meeting_room.external_id.present?
      route = user.admin? ? :admin_meeting_url : :meeting_url
      Utility::Url.generate(route, room_id: meeting_room.id, subdomain: user.subdomain)
    elsif meeting_custom?
      meeting_link
    end
  end

  def complete!
    update!(status: :completed, completed_at: Time.current)
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
    end&.dig('supportedLanguage') || pearson_assessment.languages['default']
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
    assessment_locales ||= [assessment.default_language] +
                           ::Translation.available_translation_for_assessment(assessment.id)
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

  def data_controller_consent_required?(user)
    return false unless assessment.data_role_controller?

    !data_controller_consent_given?(user)
  end

  def has_ai_scoring_approval_flow?
    AI::ScoringApprovalSetting.exists?(campaign_id: campaign_id, assessment_id: assessment_id)
  end

  def ai_scoring_approved?
    %w[assessor_approved approver_approved].include?(approval_status)
  end

  def auto_approve_scoring!
    update!(approval_status: 'auto_approved', approval_status_updated_at: Time.current)
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
    if project_assessments.loaded?
      project_assessments.find { |pa| pa.assessment_id == assessment_id }
    else
      project_assessments.find_by(assessment_id: assessment_id)
    end
  end

  def update_mettl_schedule!(mettl_schedule_record_id)
    return unless not_started?
    return unless mettl?

    mettl_user_assessment.update!(mettl_schedule_record_id: mettl_schedule_record_id)
  end

  def update_content_variation!(content_variation_id)
    return unless not_started?
    return unless simulation?

    simulation_user_assessment.update!(content_variation_id: content_variation_id)
  end

  def update_mhs_confidence_interval!(confidence_interval)
    return unless not_started?
    return unless mhs?

    mhs_user_assessment.update!(confidence_interval: confidence_interval)
  end

  def update_mhs_leadership_bar!(leadership_bar)
    return unless not_started?
    return unless mhs?

    mhs_user_assessment.update!(leadership_bar: leadership_bar)
  end

  def update_mhs_norm_region!(norm_region)
    return unless not_started?
    return unless mhs?

    mhs_user_assessment.update!(norm_region: norm_region)
  end

  def update_mhs_norm_option!(norm_option)
    return unless not_started?
    return unless mhs?

    mhs_user_assessment.update!(norm_option: norm_option)
  end

  def associated_workshops
    campaign_assessment&.campaign_assessment_group&.workshops
  end

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

  def publish_assessment_assigned_webhook
    UserAssessments::Webhook.new(self).publish_assessment_assigned
  end

  def publish_campaign_user_assessment_summary_webhook
    UserAssessments::Webhook.new(self).publish_campaign_user_assessment_summary
  end

  def publish_assessment_started_webhook
    UserAssessments::Webhook.new(self).publish_assessment_started
  end

  def publish_assessment_timeout_webhook
    UserAssessments::Webhook.new(self).publish_assessment_timeout
  end

  def trigger_microsite_registration
    Microsite::RegisterParticipantJob.perform_later(id)
  end

  def should_send_workshop_invite_email?
    prework? &&
      status_previously_changed? && completed? &&
      campaign.campaign_options.workshop_invite_requires_prework_completion?
  end

  def send_workshop_invite_email
    WorkshopInvitedSubject.
      joins(:workshop_invite).
      where(user_id: subject_id, status: 'pending').
      where(workshop_invites: { campaign_id: campaign_id }).
      includes(:workshop_invite).
      find_each do |invited_subject|
      WorkshopInvites::SendEmail.call!(invited_subject)
    end
  end

  def caching_enabled?
    campaign_assessment&.caching_enabled?
  end

  def proctoring_enabled?
    return false unless campaign&.proctoring_enabled?

    if campaign.selective_proctoring_enabled?
      campaign_assessment&.proctoring_enabled?
    elsif workshop_activity?
      campaign.proctoring_enabled_on_workshop_activity?
    else
      true
    end
  end

  def compute_expiry_date
    return additional_time&.seconds&.from_now if interrupted?

    if not_started? || expiry_date.nil?
      return calculated_expiry_date
    end

    expiry_date
  end

  private

  def calculated_expiry_date
    assessment.extra['timer']&.seconds&.from_now
  end

  def backfill_users_result_tenant_id
    return if users_result.blank? || users_result.tenant_id.present? || tenant_id.blank?

    users_result.update_column(:tenant_id, tenant_id)
  end

  def data_controller_consent_given?(user)
    user.privacy_consents.exists?(
      campaign_id: campaign_id,
      assessment_id: assessment.id,
      version: assessment.policy_version,
      data_role: :controller
    )
  end

  def enqueue_media_response_transcriptions
    users_result&.media_responses&.
      joins(:question)&.
      where(questions: { type: %w[VideoResponse AudioResponse] })&.
      where("questions.props ->> 'enableTranscription' = ?", 'true')&.
      find_each do |media_response|
      next unless media_response.transcription_not_requested?
      next unless media_response.asset.attached?

      MediaResponses::AddTranscriptionJob.perform_later(media_response.id)
    end
  end

  def reset_user_report_approval_status
    return unless completed?
    return if self_assessment?

    user_reports.each do |user_report|
      next if user_report.not_ready?

      user_report.update!(approval_status: :not_ready) unless user_report.all_assessments_are_scored?
    end
  end
end
# rubocop:enable Metrics/ClassLength
