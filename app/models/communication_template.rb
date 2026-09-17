# frozen_string_literal: true

class CommunicationTemplate < ApplicationRecord
  extend Mobility

  translates :subject, :body

  has_paper_trail

  include Tenantable
  include RansackSearchableFields

  belongs_to :client, optional: true
  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :campaign, optional: true
  # A fork's parent is very often platform-level (tenant_id: nil, visible from every tenant) --
  # unscope just the tenant_id condition so the lineage association still loads under a real
  # tenant-scoped request, same reasoning as CommunicationDelivery#communication_template.
  belongs_to :inherits_from_template, -> { unscope(where: :tenant_id) }, class_name: 'CommunicationTemplate',
                                                                          optional: true
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

  has_many :derived_templates, class_name: 'CommunicationTemplate',
                               foreign_key: :inherits_from_template_id, dependent: :nullify
  has_many :deliveries, class_name: 'CommunicationDelivery', dependent: :restrict_with_error

  enum :kind, {
    invitation: 0,
    reminder: 1,
    completion: 2,
    other: 3,
    workshop_invite: 4,
    workshop_invite_reminder: 5,
    workshop_booked: 6,
    workshop_upcoming_reminder: 7,
    workshop_cancelled: 8,
    workshop_completed: 9,
    magic_link_email: 10,
    report_available: 11,
    idp_template_assigned: 12,
    idp_template_approved: 13,
    idp_template_rejected: 14,
    development_action_deadline_missed: 15,
    idp_deadline_missed: 16,
    assessment_center_booking_summary: 17
  }

  DELIVERABLE_KINDS = %w[
    invitation reminder other workshop_invite_reminder assessment_center_booking_summary report_available
    completion magic_link_email idp_template_assigned idp_template_approved idp_template_rejected
    idp_deadline_missed development_action_deadline_missed
    workshop_invite workshop_booked workshop_cancelled workshop_upcoming_reminder
  ].freeze

  enum :level, { platform: 0, client: 1, project: 2, campaign: 3 }

  enum :status, { draft: 0, active: 1, archived: 2 }

  enum :recipients_default, { all: 0, selected: 1, new_users: 2, new_assignment: 3 }, suffix: true

  validates :name, presence: true
  validates :kind, presence: true
  validates :level, presence: true
  validates :client, presence: true, if: -> { client? || project? || campaign? }
  validates :project, presence: true, if: -> { project? || campaign? }
  validates :campaign, presence: true, if: :campaign?
  validates :subject, :body, presence: true, if: :active?

  def self.ransackable_attributes(_auth_object = nil)
    %w[
      campaign_id client_id created_at created_by_id delivery_defaults id
      inherits_from_template_id kind level name project_id recipients_default
      status tenant_id updated_at updated_by_id
    ]
  end
end
