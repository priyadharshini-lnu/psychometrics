# == Schema Information
#
# Table name: communications
#
#  id                :integer          not null, primary key
#  subject           :string
#  body              :text
#  assessment_id     :integer
#  client_id         :integer
#  recipients        :integer          default("all")
#  disabled          :boolean          default(FALSE)
#  delivery_rule     :integer          default("on_specific_datetime")
#  delivery_at       :datetime
#  delivery_interval :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  owner_id          :integer
#

class Communication < ApplicationRecord
  REMINDER_AND_INVITATION_JOBS = {
    not_started: ::Communications::ReminderType::NotStartedJob,
    not_competed: ::Communications::ReminderType::NotCompletedJob,
    in_progress: ::Communications::ReminderType::InProgressJob,
    specific_datetime: ::Communications::InvitationTypeJob,
    send_now: ::Communications::InvitationTypeJob
  }.freeze

  attr_accessor :delivery_interval_number, :delivery_interval_period, :reminder_type
  has_and_belongs_to_many :memberships, join_table: :communications_memberships
  has_and_belongs_to_many :copy_memberships, join_table: :communications_copy_memberships, class_name: 'Membership'
  has_many :emails, dependent: :destroy, inverse_of: :communication, class_name: 'CommunicationEmail'
  has_many :communications_users
  has_many :users, through: :communications_users
  belongs_to :assessment
  belongs_to :client
  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id
  belongs_to :project, class_name: 'Client', foreign_key: :project_id
  belongs_to :campaign, class_name: 'Client', foreign_key: :campaign_id
  belongs_to :sub_campaign, class_name: 'Client', foreign_key: :sub_campaign_id
  belongs_to :end_level, class_name: 'Client', foreign_key: :end_level_id
  belongs_to :creator, class_name: 'User'

  enum recipients: [:all, :selected], _suffix: true
  enum kind: { invitation: 0, reminder: 1, completion: 2, other: 3 }
  enum delivery_rule: { send_now: 0, specific_datetime: 1, not_started: 2, not_competed: 3, in_progress: 4 }

  after_validation :set_delivery_interval, if: :reminder?
  after_initialize :parse_delivery_interval, if: :reminder?


  after_commit :send_email_now, on: :create
  after_create_commit ::Callbacks::Models::Communications::CreateSendEmailJob.new

  # SCOPES
  scope :invitation_for_end_level_id, -> (end_level_id) { where(kind: 'invitation').where(end_level_id: end_level_id) }

  def self.lower_communications(communication)
    Communication.where(kind: communication.kind).where(delivery_rule: communication.delivery_rule).
      where(end_level_id: communication.end_level.descendant_ids)
  end

  def selected_memberships
    ::Queries::Memberships::ForCommunication.call(self).join_user
  end

  def selected_memberships_ids
    ::Queries::Memberships::ForCommunication.call(self).pluck(:id)
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
    self.delivery_interval_number = delivery_interval.split(' ').first.to_i
    self.delivery_interval_period = delivery_interval.split(' ').last
  end

  # Copy Communication
  def clone
    deep_clone include: [:memberships, :copy_memberships]
  end

  def end_level_id
    sub_campaign_id || campaign_id || project_id || client_id || owner_id
  end

  def end_level
    sub_campaign || campaign || project || client || owner
  end

  def current_memberships_ids
    return selected_memberships_ids if end_level.end_level?
    selected_memberships_ids - low_level_ids
  end

  def current_memberships
    Membership.where(id: current_memberships_ids).join_user
  end

  def delivery_interval_duration
    valid_methods = %w[hour hours day days week weeks month months]
    valid_methods.unshift('minute', 'minutes') unless Rails.env.production?
    return unless reminder? && valid_methods.include?(delivery_interval_period.downcase)
    delivery_interval_number.to_i.public_send(delivery_interval_period)
  end

  def send_email_job
    return if %w[reminder invitation].exclude?(kind)
    REMINDER_AND_INVITATION_JOBS[delivery_rule&.to_sym]
  end

  def emails_creating
    selected_memberships.find_each(batch_size: 10) do |membership|
      emails.create(membership: membership)
    end
  end

  def not_invited_to_project_current_memberships
    current_memberships.distinct.reject(&:already_invited?)
  end

  private

  def send_email_now
    return unless other? && send_now?
    emails_creating
  end

  def low_level_ids
    Communication.lower_communications(self).flat_map(&:selected_memberships_ids).uniq
  end
end
