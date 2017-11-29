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
  attr_accessor :delivery_at_date, :delivery_at_time, :delivery_interval_number, :delivery_interval_period,
                :reminder_type
  has_and_belongs_to_many :memberships, join_table: :communications_memberships
  has_and_belongs_to_many :copy_memberships, join_table: :communications_copy_memberships, class_name: 'Membership'
  has_many :emails, dependent: :destroy, inverse_of: :communication, class_name: 'CommunicationEmail'
  belongs_to :assessment
  belongs_to :client
  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id
  belongs_to :project, class_name: 'Client', foreign_key: :project_id
  belongs_to :campaign, class_name: 'Client', foreign_key: :campaign_id
  belongs_to :sub_campaign, class_name: 'Client', foreign_key: :sub_campaign_id
  belongs_to :end_level, class_name: 'Client', foreign_key: :end_level_id

  enum recipients: [:all, :selected], _suffix: true
  enum kind: { invitation: 0, reminder: 1, completion: 2, other: 3 }
  enum delivery_rule: { send_now: 0, specific_datetime: 1, not_started: 2, not_competed: 3, in_progress: 4 }

  after_validation :set_delivery_interval, if: :reminder?
  after_initialize :parse_delivery_interval, if: :reminder?
  # SCOPES
  scope :enabled, -> { where(disabled: false) }

  after_commit :change_user_link_to_link_for_mustache, on: :create
  after_commit :send_email_now, on: :create

  def selected_memberships
    ids = if selected_recipients?
            membership_ids
          else
            end_level.final_children_arr.map(&:membership_ids).flatten.presence || end_level.membership_ids
          end
    Membership.where(id: ids).join_user
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

  def set_delivery_at
    self.delivery_at = DateTime.parse("#{delivery_at_date} #{delivery_at_time}")
  end

  def set_delivery_interval
    self.delivery_interval = "#{delivery_interval_number} #{delivery_interval_period}"
  end

  # Parse self.delivery_at to date and time
  # Example: '2016-11-04 10:48:33' to 2016-11-04 and 10:48 AM
  def parse_delivery_at
    return if delivery_at.blank?
    self.delivery_at_date = delivery_at.strftime('%Y-%m-%d')
    self.delivery_at_time = delivery_at.strftime('%l:%M %p')
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
    sub_campaign_id || campaign_id || project_id || client_id
  end

  def end_level
    sub_campaign || campaign || project || client
  end

  def emails_creating
    end_level.final_children_arr.each do |client|
      client.memberships.member.find_each(batch_size: 10) do |membership|
        emails.create(membership: membership)
      end
    end
  end

  private

  def send_email_now
    return unless other? && send_now?
    emails_creating
  end

  def change_user_link_to_link_for_mustache
    update_column(:body, body.gsub('{{user_link}}', '{{{user_link}}}'))
  end
end
