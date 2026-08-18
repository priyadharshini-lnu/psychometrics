# frozen_string_literal: true

class DataReport < ApplicationRecord
  include GeoFilterable
  include RansackSearchableFields

  audited

  belongs_to :owner, class_name: 'Client', optional: true
  belongs_to :last_updated_by, class_name: 'User'

  include Tenantable

  before_validation :set_scope_for_client_reports
  before_save :update_last_updated_by

  has_many :data_report_jobs, dependent: :destroy

  enum :report_type, {
    json_data_report: 0,
    user_reports_export: 1,
    user_created_dates: 2,
    saville_usage_report: 3,
    pearson_usage_report: 4,
    hogan_usage_report: 5,
    report_usage_summary: 6,
    client_assessment_counts: 7,
    active_clients_projects: 8,
    user_access_review: 9,
    campaign_factor_scores: 10,
    campaign_user_creation: 11,
    proctoring_sessions: 12
  }

  enum :scope, { client: 0, global: 1 }, prefix: :scope

  validates :report_type, presence: true
  validates :scope, presence: true
  validates :owner, presence: true, if: -> { scope_client? }
  validates :owner_id, absence: true, if: -> { scope_global? }

  scope :global_reports, -> { where(scope: :global) }
  scope :client_reports, -> { where(scope: :client) }

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    where('owner_id IS NULL OR owner_id NOT IN (?)', restricted_client_subquery)
  end

  def update_last_updated_by
    self.last_updated_by = Current.user
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name configuration created_at id_value updated_at last_updated_by_id owner_id report_type scope]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[audits data_report_jobs last_updated_by owner tenant]
  end

  def runtime_parameters_enabled
    handler_class = AdminJobs::DataReportExport::REPORT_TYPE_HANDLERS[report_type]
    handler_class&.runtime_parameters&.any? || false
  end

  # Ransacker for scope enum - converts string values to integers for filtering
  ransacker :scope, formatter: proc { |v| scopes[v] } do |parent|
    parent.table[:scope]
  end

  ransacker :report_type, formatter: proc { |v| report_types[v] } do |parent|
    parent.table[:report_type]
  end

  private

  def set_scope_for_client_reports
    self.scope = :client if scope.blank? && owner_id.present?
  end
end
