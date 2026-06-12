# frozen_string_literal: true

class Session < ActiveRecord::SessionStore::Session
  belongs_to :user, optional: true
  belongs_to :client, foreign_key: :tenant_id, optional: true
  belongs_to :impersonator, class_name: 'User', optional: true

  scope :active, -> { where(updated_at: SESSION_STALE_THRESHOLD.ago..) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  scope :for_subdomain, ->(subdomain) { where(subdomain: subdomain) }
  scope :for_client, ->(tenant_id) { where(tenant_id: tenant_id) }
  scope :real, -> { where(impersonator_id: nil) }
  scope :impersonated, -> { where.not(impersonator_id: nil) }

  SESSION_STALE_THRESHOLD = 24.hours

  before_save :populate_queryable_columns

  def self.cleanup_old_sessions(older_than: 30.days.ago)
    where('updated_at < ?', older_than).delete_all
  end

  private

  def populate_queryable_columns
    return unless data.is_a?(Hash)

    extract_user_id_from_warden
    extract_client_and_impersonator
    self.subdomain ||= RequestStore.store[:client_admin_subdomain]
  end

  def extract_user_id_from_warden
    warden_key = data['warden.user.user.key']
    self.user_id = warden_key.first&.first if warden_key.is_a?(Array)
  end

  def extract_client_and_impersonator
    self.tenant_id ||= data[:client_id] || data['client_id']
    self.impersonator_id ||= data[:impersonated_by_id] || data['impersonated_by_id']
  end
end
