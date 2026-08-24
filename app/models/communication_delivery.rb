# frozen_string_literal: true

class CommunicationDelivery < ApplicationRecord
  extend Mobility

  translates :subject, :body

  include Tenantable

  # Platform-level templates have tenant_id: nil by design (visible from every tenant). A plain
  # belongs_to would apply acts_as_tenant's default scope and silently fail to load (returning nil)
  # under any tenant-scoped request or background job whenever the referenced template is
  # platform-level -- unscope just the tenant_id condition, not the association's own id match.
  belongs_to :communication_template, -> { unscope(where: :tenant_id) }
  belongs_to :campaign, optional: true
  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :campaign_assessment_group, optional: true
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

  has_many :emails, class_name: 'CommunicationEmail', dependent: :restrict_with_error
  has_many :communication_delivery_users, dependent: :destroy
  has_many :selected_users, through: :communication_delivery_users, source: :user
  has_many :communication_delivery_cc_users, dependent: :destroy
  has_many :cc_users, through: :communication_delivery_cc_users, source: :user
  has_many :communication_delivery_assessments, dependent: :destroy
  has_many :selected_assessments, through: :communication_delivery_assessments, source: :assessment

  accepts_nested_attributes_for :communication_delivery_users, allow_destroy: true
  accepts_nested_attributes_for :communication_delivery_cc_users, allow_destroy: true
  accepts_nested_attributes_for :communication_delivery_assessments, allow_destroy: true

  delegate :kind, to: :communication_template

  # Kinds that may be scoped to either a campaign or a project (never both) -- unlike magic_link_email,
  # which is project-only, these can be authored at whichever level the operator wants, with the
  # campaign-level delivery taking priority at send time when both exist (see .active_for_kind).
  PROJECT_SCOPABLE_KINDS = %w[
    idp_template_assigned idp_template_approved idp_template_rejected idp_deadline_missed
    development_action_deadline_missed
  ].freeze

  enum :trigger_type, { manual: 0, scheduled: 1 }

  enum :status, {
    draft: 0, enqueued: 1, active: 2, completed: 3, failed: 4, cancelled: 5, paused: 6
  }

  enum :delivery_rule, { send_now: 0, specific_datetime: 1, not_started: 2, not_completed: 3, in_progress: 4 }

  enum :recipients, { all: 0, selected: 1, new_users: 2, new_assignment: 3 }, suffix: true

  validates :trigger_type, presence: true
  validate :campaign_or_project_scope

  after_create_commit { Communications::Deliveries::Trigger.call(self) }

  # Campaign-or-project lookup for the IDP-shaped kinds (campaign takes priority, falls back to project).
  # None of these kinds filter by campaign_assessment_group_id -- see .active_for_campaign_assessment_group
  # for the workshop-shaped kinds, which are campaign-only and always need that extra filter.
  def self.active_for_kind(kind, campaign_id: nil, project_id: nil)
    return nil unless Client.communication_center_active?(campaign_id: campaign_id, project_id: project_id)

    if campaign_id
      delivery = joins(:communication_template).
                 find_by(communication_templates: { kind: kind }, campaign_id: campaign_id, status: :active)
      return delivery if delivery
    end

    return nil unless project_id

    joins(:communication_template).
      find_by(communication_templates: { kind: kind }, project_id: project_id, status: :active)
  end

  # Campaign + assessment-group lookup for the workshop-shaped kinds (workshop_invite, workshop_booked,
  # workshop_cancelled, workshop_upcoming_reminder) -- these are never project-scoped, unlike the IDP kinds
  # above, so there's no campaign/project priority to resolve.
  def self.active_for_campaign_assessment_group(kind, campaign_id:, campaign_assessment_group_id:)
    return nil unless Client.communication_center_active?(campaign_id: campaign_id)

    joins(:communication_template).
      find_by(communication_templates: { kind: kind }, campaign_id: campaign_id,
              campaign_assessment_group_id: campaign_assessment_group_id, status: :active)
  end

  # The org-level Client this delivery belongs to, regardless of whether it's campaign- or
  # project-scoped -- Client#client (has_ancestry's `root`) walks up to the org-level row from
  # either the campaign's project or the delivery's own project association.
  def client
    (campaign&.project || project)&.client
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[trigger_type status delivery_rule communication_template_id created_at updated_at tenant_id]
  end

  private

  # communication_template can be blank on an unsaved/matcher-built instance (e.g. shoulda-matchers'
  # association specs) -- read it directly rather than through the `kind` delegate, which raises on nil.
  def campaign_or_project_scope
    kind = communication_template&.kind
    if kind == 'magic_link_email'
      project_only_scope_errors
    elsif PROJECT_SCOPABLE_KINDS.include?(kind)
      campaign_or_project_scope_errors
    elsif campaign.blank?
      errors.add(:campaign, :blank)
    end
  end

  def project_only_scope_errors
    errors.add(:project, :blank) if project.blank?
    errors.add(:campaign, :present) if campaign.present?
  end

  def campaign_or_project_scope_errors
    errors.add(:base, 'campaign or project is required') if campaign.blank? && project.blank?
    errors.add(:base, 'campaign and project cannot both be set') if campaign.present? && project.present?
  end
end
