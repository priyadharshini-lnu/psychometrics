# frozen_string_literal: true

class ApplicationIpWhitelistEntry < ApplicationRecord
  audited

  belongs_to :application_setting
  has_one :application, through: :application_setting, source: :application

  include Tenantable

  tenant_source :application_setting

  validates :ip_or_cidr, presence: true
  validate :ip_or_cidr_format

  scope :enabled, -> { where(enabled: true) }

  before_save :capture_enabled_change_tuple
  after_commit :sync_whitelisting_after_disable, on: :update
  after_commit :sync_whitelisting_after_destroy, on: :destroy

  attr_accessor :enabled_change_tuple

  def self.ransackable_attributes(_auth_object = nil)
    %w[id application_setting_id ip_or_cidr enabled]
  end

  def matches_ip?(ip_address)
    return false if ip_address.blank?

    ip_or_cidr.include?(ip_address)
  rescue IPAddr::InvalidAddressError, IPAddr::AddressFamilyError
    false
  end

  private

  def capture_enabled_change_tuple
    self.enabled_change_tuple = changes['enabled']
  end

  def ip_or_cidr_format
    return if ip_or_cidr.blank?

    IPAddr.new(ip_or_cidr.to_s)
  rescue IPAddr::InvalidAddressError, IPAddr::AddressFamilyError
    errors.add(:ip_or_cidr, :invalid)
  end

  def sync_whitelisting_after_disable
    return unless enabled_change_tuple == [true, false]

    application_setting&.sync_ip_whitelisting_enabled!
  end

  def sync_whitelisting_after_destroy
    resolve_application_setting&.sync_ip_whitelisting_enabled!
  end

  def resolve_application_setting
    application_setting || ApplicationSetting.find_by(id: application_setting_id)
  end
end
