# frozen_string_literal: true

class Webhook < WebhookSystem::Subscription
  include SoftDelete

  EVENTS = {
    assessment_started: WebhookEvents::AssessmentStarted,
    assessment_completed: WebhookEvents::AssessmentCompleted,
    assessment_timeout: WebhookEvents::AssessmentTimeout,
    results_available: WebhookEvents::ResultsAvailable,
    report_available: WebhookEvents::ReportAvailable
  }.freeze

  USER_REPORT_EVENTS = {
    results_available: 'results_available',
    report_available: 'report_available'
  }.freeze

  belongs_to :project

  validates :url, http_url: { presence: true }
  validates :description, :auth_type, presence: true

  scope :active, -> { where(active: true) }
  scope :webhooks_of, ->(project_id) { where(project_id: project_id) }

  enum auth_type: { no_auth: 0, basic_auth: 1 }

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end

  scope :filterable_fields, lambda { |query|
    where(
      'webhook_subscriptions.description ILIKE :query OR webhook_subscriptions.url ILIKE :query',
      query: "%#{query}%"
    )
  }
end
