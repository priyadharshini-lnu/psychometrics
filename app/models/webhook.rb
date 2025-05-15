# frozen_string_literal: true

class Webhook < WebhookSystem::Subscription
  include SoftDelete

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
    campaign_results_available: WebhookEvents::CampaignResultsAvailable,
    campaign_user_status: WebhookEvents::CampaignUserStatus
  }.freeze

  USER_REPORT_EVENTS = {
    results_available: 'results_available',
    report_available: 'report_available'
  }.freeze

  belongs_to :project

  validates :url, http_url: { presence: true }
  validates :description, :auth_type, presence: true
  validates :api_key_header, format: { with: /\A[a-zA-Z0-9_-]+\z/ }, allow_blank: true

  scope :active, -> { where(active: true) }
  scope :webhooks_of, ->(project_id) { where(project_id: project_id) }

  enum :auth_type, { no_auth: 0, basic_auth: 1, api_key_auth: 2 }

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
end
