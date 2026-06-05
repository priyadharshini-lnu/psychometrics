# frozen_string_literal: true

class Webhook < WebhookSystem::Subscription
  include SoftDelete
  include ApplicationConfigurationLoggable

  EVENTS = {
    assessment_started: WebhookEvents::AssessmentStarted,
    assessment_completed: WebhookEvents::AssessmentCompleted,
    assessment_assigned: WebhookEvents::AssessmentAssigned,
    assessment_timeout: WebhookEvents::AssessmentTimeout,
    results_available: WebhookEvents::ResultsAvailable,
    report_available: WebhookEvents::ReportAvailable,
    scheduling_scheduled: WebhookEvents::SchedulingScheduled,
    scheduling_rescheduled: WebhookEvents::SchedulingRescheduled,
    scheduling_cancelled: WebhookEvents::SchedulingCancelled,
    scheduling_invited: WebhookEvents::SchedulingInvited,
    workshop_attendance_status: WebhookEvents::WorkshopAttendanceStatus,
    campaign_results_available: WebhookEvents::CampaignResultsAvailable,
    campaign_user_status: WebhookEvents::CampaignUserStatus,
    assessment_raw_response: WebhookEvents::AssessmentRawResponse,
    campaign_user_assessment_summary: WebhookEvents::CampaignUserAssessmentSummary
  }.freeze

  USER_REPORT_EVENTS = {
    results_available: 'results_available',
    report_available: 'report_available'
  }.freeze

  ALLOWED_TYPES_FOR_ASSESSMENT_RAW_REPONSE_EVENT = [
    Assessment::PSYCHOMETRIC,
    Assessment::ORGANISATIONAL
  ].freeze

  belongs_to :project
  include Tenantable

  after_update :clear_assessment_ids_if_needed

  validates :url, http_url: { presence: true }
  validates :description, :auth_type, presence: true
  validates :api_key_header, format: { with: /\A[a-zA-Z0-9_-]+\z/ }, allow_blank: true
  validates :oauth_grant_type, :oauth_token_url, :oauth_client_id, :oauth_client_secret, :oauth_scope,
            presence: true, if: -> { auth_type == 'oauth' }
  validate :assessment_ids_must_be_of_valid_type

  scope :active, -> { where(active: true) }
  scope :webhooks_of, ->(project_id) { where(project_id: project_id) }

  enum :auth_type, { no_auth: 0, basic_auth: 1, api_key_auth: 2, oauth: 3 }

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id active]
  end

  scope :filterable_fields, lambda { |query|
    where(
      'webhook_subscriptions.description ILIKE :query OR webhook_subscriptions.url ILIKE :query',
      query: "%#{query}%"
    )
  }

  private

  def clear_assessment_ids_if_needed
    return if topics.pluck(:name).include?('assessment_raw_response')
    return if assessment_ids.blank?

    update_column(:assessment_ids, [])
  end

  def assessment_ids_must_be_of_valid_type
    return if assessment_ids.blank?

    assessments = Assessment.where(id: assessment_ids)

    return if assessments.all? { |assessment| assessment.category.in?(ALLOWED_TYPES_FOR_ASSESSMENT_RAW_REPONSE_EVENT) }

    errors.add(:assessment_ids, :invalid_assessment_type)
  end
end
