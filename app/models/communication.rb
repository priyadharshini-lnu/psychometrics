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
  attr_accessor :delivery_at_date, :delivery_at_time, :delivery_interval_number, :delivery_interval_period
  has_and_belongs_to_many :memberships, join_table: :communications_memberships
  has_and_belongs_to_many :copy_memberships, join_table: :communications_copy_memberships, class_name: 'Membership'
  has_many :emails, dependent: :destroy, inverse_of: :communication, class_name: 'CommunicationEmail'
  belongs_to :assessment
  belongs_to :client
  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id

  enum recipients: [:all, :selected], _suffix: true
  enum delivery_rule: [:on_specific_datetime, :after_complete, :if_not_started, :if_not_finished], _prefix: :delivery

  validates :delivery_at_date,
            :delivery_at_time,
            presence: true, if: :delivery_on_specific_datetime?
  validates :delivery_interval_number,
            :delivery_interval_period,
            presence: true, if: proc { delivery_if_not_started? || delivery_if_not_finished? }
  validates :subject, :assessment, :client, presence: true
  validates :owner, presence: true, allow_nil: true

  # CALLBACKS
  after_validation :set_delivery_at, if: :delivery_on_specific_datetime?
  after_initialize :parse_delivery_at, if: :delivery_on_specific_datetime?
  after_validation :set_delivery_interval, if: proc { delivery_if_not_started? || delivery_if_not_finished? }
  after_initialize :parse_delivery_interval, if: proc { delivery_if_not_started? || delivery_if_not_finished? }
  # after_initialize :ensure_integrity
  before_save :ensure_integrity

  # SCOPES
  scope :enabled, -> { where(disabled: false) }

  def selected_memberships
    all_recipients? ? client.memberships.join_user : memberships.join_user
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
    self.delivery_at_date = delivery_at.strftime('%Y-%m-%d') if delivery_at
    self.delivery_at_time = delivery_at.strftime('%l:%M %p') if delivery_at
  end

  # Parse self.delivery_interval to number and period
  # Example: '1 days' to 1 and 'days'
  def parse_delivery_interval
    self.delivery_interval_number = delivery_interval.split(' ').first.to_i if delivery_interval
    self.delivery_interval_period = delivery_interval.split(' ').last if delivery_interval
  end

  # Copy Communication
  def clone
    @cloned_item = deep_clone include: [:memberships, :copy_memberships]
    @cloned_item
  end
end
