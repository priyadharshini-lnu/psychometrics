# frozen_string_literal: true

class Communication < ApplicationRecord
  include GeoFilterable
  extend Mobility

  translates :subject, :body

  audited
  include OwnerValidations
  include RecurringScheduling

  WORKSHOP_COMMUNICATION_KINDS = %w[
    workshop_invite workshop_invite_reminder workshop_booked workshop_upcoming_reminder
    workshop_cancelled workshop_completed
  ].freeze
  REMINDER_AND_INVITATION_JOBS = {
    not_started: ::Communications::ReminderType::NotStartedJob,
    not_competed: ::Communications::ReminderType::NotCompletedJob,
    in_progress: ::Communications::ReminderType::InProgressJob,
    specific_datetime: ::Communications::InvitationTypeJob,
    send_now: ::Communications::InvitationTypeJob
  }.freeze

  attr_accessor :delivery_interval_number, :delivery_interval_period, :reminder_type, :assessment_selection

  has_and_belongs_to_many :memberships, join_table: :communications_memberships
  has_and_belongs_to_many :copy_memberships, join_table: :communications_copy_memberships, class_name: 'Membership'

  has_many :emails, dependent: :destroy, inverse_of: :communication, class_name: 'CommunicationEmail'
  has_many :communications_users, dependent: :destroy
  has_many :users, through: :communications_users
  has_many :communications_assessments, dependent: :destroy
  has_many :selected_assessments, through: :communications_assessments, source: :assessment
  has_many :communication_cc_users, dependent: :destroy
  has_many :cc_users, through: :communication_cc_users, source: :user

  belongs_to :assessment
  belongs_to :client
  belongs_to :owner, class_name: 'Client'
  belongs_to :project, class_name: 'Client'
  # rename project_campaign relation when we will ditch all old structures
  belongs_to :project_campaign, class_name: 'Campaign', foreign_key: :campaign_id, optional: true
  belongs_to :sub_campaign, class_name: 'Client'
  belongs_to :end_level, class_name: 'Client', optional: true
  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'
  belongs_to :campaign_assessment_group, optional: true
  has_many :workshops, through: :project_campaign
  has_many :workshop_subjects, through: :project_campaign

  include Tenantable

  belongs_to :campaign, class_name: 'Client', optional: true

  enum :recipients, { all: 0, selected: 1, new_users: 2, new_assignment: 3 }, suffix: true
  enum :kind, {
    invitation: 0, reminder: 1, completion: 2, other: 3,
    workshop_invite: 4, workshop_invite_reminder: 5,  workshop_booked: 6, workshop_upcoming_reminder: 7,
    workshop_cancelled: 8, workshop_completed: 9, magic_link_email: 10, report_available: 11, idp_template_assigned: 12,
    idp_template_approved: 13, idp_template_rejected: 14, development_action_deadline_missed: 15,
    idp_deadline_missed: 16, assessment_center_booking_summary: 17
  }

  enum :delivery_rule, { send_now: 0, specific_datetime: 1, not_started: 2, not_competed: 3, in_progress: 4 }

  after_initialize :parse_delivery_interval, if: :reminder_type?
  after_validation :set_delivery_interval, if: :reminder_type?
  before_create -> { self.last_ran_at ||= Time.zone.now }, if: :new_assignment_recipients?
  after_commit :send_email_now, on: :create
  after_create_commit ::Callbacks::Models::Communications::CreateSendEmailJob.new
  after_create_commit :schedule_assessment_center_booking_summary_emails, if: :assessment_center_booking_summary?

  # SCOPES
  scope :invitation_for_end_level_id, ->(end_level_id) { where(kind: 'invitation').where(end_level_id: end_level_id) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id subject body client_id kind created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[users client created_by]
  end

  def reminder_type?
    reminder? || workshop_invite_reminder?
  end

  def self.lower_communications(communication)
    Communication.where(kind: communication.kind).where(delivery_rule: communication.delivery_rule).
      where(end_level_id: communication.end_level.descendant_ids)
  end

  def workshop_communication?
    WORKSHOP_COMMUNICATION_KINDS.include?(kind)
  end

  def selected_campaign_users
    return CampaignUser.none if project_campaign.blank?

    communication_users = project_campaign.campaign_users.joins(:user).where(users: { disabled: false }, active: true)
    return communication_users.where(user_id: user_ids) if selected_recipients?

    communication_users
  end

  # If Delivery Rule is specific date time then delivery_interval set to nil
  # If DR is if not started or not finished then delivery_at set to nil
  def ensure_integrity
    self.delivery_at = nil unless delivery_on_specific_datetime?
    self.delivery_interval = nil if !delivery_if_not_started? && !delivery_if_not_finished?
    self.client_id = nil if assessment_id.blank?
    self.membership_ids = nil if client_id.blank?
    self.copy_membership_ids = nil if client_id.blank?
  end

  def set_delivery_interval
    self.delivery_interval = "#{delivery_interval_number} #{delivery_interval_period}"
  end

  # Parse self.delivery_interval to number and period
  # Example: '1 days' to 1 and 'days'
  def parse_delivery_interval
    return if delivery_interval.blank?

    self.delivery_interval_number = delivery_interval.split.first.to_i
    self.delivery_interval_period = delivery_interval.split.last
  end

  # Copy Communication
  def clone
    deep_clone include: %i[memberships copy_memberships]
  end

  def end_level_id
    sub_campaign_id || campaign_id || project_id || client_id || owner_id
  end

  def end_level
    sub_campaign || campaign || project || client || owner
  end

  def delivery_interval_duration
    valid_methods = %w[hour hours day days week weeks month months]
    valid_methods.unshift('minute', 'minutes') unless Rails.env.production?
    return unless reminder_type? && valid_methods.include?(delivery_interval_period.downcase)

    delivery_interval_number.to_i.public_send(delivery_interval_period)
  end

  def send_email_job
    return Communications::WorkshopInviteReminderJob if workshop_invite_reminder?

    return if %w[reminder invitation].exclude?(kind)

    REMINDER_AND_INVITATION_JOBS[delivery_rule&.to_sym]
  end

  def emails_creating
    selected_campaign_users.find_each(batch_size: 100) do |campaign_user|
      emails.create(campaign_user: campaign_user)
    end
  end

  def not_invited_to_project_current_memberships
    selected_campaign_users.where(users: { already_invited: false })
  end

  def log_attribute_for_delete
    slice(:client_id, :project_id, :campaign_id)
  end

  def campaign_users_not_recently_invited
    campaign_users_recently_invited = CommunicationEmail.
                                      invitation_within_last_24_hrs(project_id).
                                      select(:campaign_user_id)

    selected_campaign_users.where.not(id: campaign_users_recently_invited)
  end

  def create_communication_email_with_resources(attributes, resources)
    CommunicationEmail.create_with_resources(attributes.merge(communication_id: id), resources)
  end

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    where.not(client_id: restricted_client_subquery).
      where('owner_id IS NULL OR owner_id NOT IN (?)', restricted_client_subquery)
  end

  private

  def send_email_now
    return unless other? && send_now?

    emails_creating
  end

  def schedule_assessment_center_booking_summary_emails
    schedule_repeated_emails(job: Communications::AssessmentCenterBookingSummaryJob, last_run_date: nil)
  end
end
