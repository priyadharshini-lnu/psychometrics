# frozen_string_literal: true

class ApplicationUrlWhitelistEntry < ApplicationRecord
  audited

  # URL pattern supporting http/https with optional wildcards in subdomains and paths
  # Examples: https://example.com/*, https://*.example.com/api/*, https://example.com:8080/path
  URL_PATTERN = %r{^https?://(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?((/[a-zA-Z0-9\-._~:@!$&'()+,;=%*]*)*)/?$} # rubocop:disable Layout/LineLength

  belongs_to :application_setting
  has_one :application, through: :application_setting, source: :application

  include Tenantable

  tenant_source :application_setting

  validates :url, presence: true
  validate :url_format

  scope :enabled, -> { where(enabled: true) }

  before_save :capture_enabled_change_tuple
  after_commit :sync_whitelisting_after_disable, on: :update
  after_commit :sync_whitelisting_after_destroy, on: :destroy

  attr_accessor :enabled_change_tuple

  def self.ransackable_attributes(_auth_object = nil)
    %w[id application_setting_id url enabled]
  end

  def matches_url?(return_url)
    return false if return_url.blank? || url.blank?

    whitelist = url.chomp('/')
    target = return_url.split(/[?#]/, 2).first.to_s.chomp('/')

    pattern = Regexp.escape(whitelist).
              gsub('\\*\\.', '__SUBDOMAIN_WILDCARD__').
              gsub('/\\*', '__PATH_WILDCARD__').
              gsub('\\*', '.*').
              gsub('__SUBDOMAIN_WILDCARD__', '(?:.*\\.)?').
              gsub('__PATH_WILDCARD__', '(/.*)?')

    Regexp.new("\\A#{pattern}\\z").match?(target)
  rescue RegexpError
    false
  end

  private

  def capture_enabled_change_tuple
    self.enabled_change_tuple = changes['enabled']
  end

  def url_format
    return if url.blank?

    errors.add(:url, :invalid) unless URL_PATTERN.match?(url)
  end

  def sync_whitelisting_after_disable
    return unless enabled_change_tuple == [true, false]

    application_setting&.sync_url_whitelisting_enabled!
  end

  def sync_whitelisting_after_destroy
    resolve_application_setting&.sync_url_whitelisting_enabled!
  end

  def resolve_application_setting
    application_setting || ApplicationSetting.find_by(id: application_setting_id)
  end
end
