# frozen_string_literal: true

class ApplicationSetting < ApplicationRecord
  audited

  belongs_to :application, class_name: 'Users::Application', foreign_key: :user_id, inverse_of: :application_setting
  has_many :ip_whitelist_entries,
           class_name: 'ApplicationIpWhitelistEntry',
           dependent: :destroy
  has_many :url_whitelist_entries,
           class_name: 'ApplicationUrlWhitelistEntry',
           dependent: :destroy

  include Tenantable

  tenant_source :application

  validate :validate_ip_whitelists_if_enabled
  validate :validate_url_whitelists_if_enabled

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

  def url_allowed?(url)
    return true unless url_whitelisting_enabled?
    return false if url_whitelist_entries.enabled.empty?

    url_whitelist_entries.enabled.any? do |whitelist|
      whitelist.matches_url?(url)
    end
  end

  def sync_url_whitelisting_enabled!
    return unless url_whitelisting_enabled?
    return if url_whitelist_entries.enabled.exists?

    ApplicationSetting.where(id: id, url_whitelisting_enabled: true).
      update_all(url_whitelisting_enabled: false, updated_at: Time.current)
  end

  private

  def validate_ip_whitelists_if_enabled
    if ip_whitelisting_enabled && ip_whitelist_entries.enabled.empty?
      errors.add(:base, I18n.t('admin.application_settings_at_least_one_ip_required'))
    end
  end

  def validate_url_whitelists_if_enabled
    if url_whitelisting_enabled && url_whitelist_entries.enabled.empty?
      errors.add(:base, I18n.t('admin.application_settings_at_least_one_url_required'))
    end
  end
end
