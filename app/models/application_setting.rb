# frozen_string_literal: true

class ApplicationSetting < ApplicationRecord
  audited

  belongs_to :application, class_name: 'Users::Application', foreign_key: :user_id, inverse_of: :application_setting
  has_many :ip_whitelist_entries,
           class_name: 'ApplicationIpWhitelistEntry',
           dependent: :destroy

  include Tenantable

  tenant_source :application

  validate :validate_ip_whitelists_if_enabled

  def ip_allowed?(ip_address)
    return true unless ip_whitelisting_enabled?
    return false if ip_whitelist_entries.enabled.empty?

    ip_obj = IPAddr.new(ip_address)
    ip_whitelist_entries.enabled.any? do |whitelist|
      whitelist.matches_ip?(ip_obj)
    end
  rescue IPAddr::InvalidAddressError
    false
  end

  def sync_ip_whitelisting_enabled!
    return unless ip_whitelisting_enabled?
    return if ip_whitelist_entries.enabled.exists?

    ApplicationSetting.where(id: id, ip_whitelisting_enabled: true).
      update_all(ip_whitelisting_enabled: false, updated_at: Time.current)
  end

  private

  def validate_ip_whitelists_if_enabled
    if ip_whitelisting_enabled && ip_whitelist_entries.enabled.empty?
      errors.add(:base, I18n.t('admin.application_settings_at_least_one_ip_required'))
    end
  end
end
