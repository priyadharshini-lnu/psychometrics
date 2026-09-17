# frozen_string_literal: true

class AI::VoiceCharacter < ApplicationRecord
  self.table_name = 'ai_voice_characters'

  audited only: %i[name provider external_voice_id locale style rate pitch tenant_id]

  include RansackSearchableFields

  belongs_to :last_modified_by, class_name: 'User', optional: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  enum :provider, {
    azure: 0
  }, default: :azure

  validates :name, presence: true
  validates :external_voice_id, presence: true

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[provider locale]
  end

  def sample_text
    I18n.t('admin.tts_sample_text')
  end

  private

  # Tenant is assigned directly from the admin UI, never derived from another record.
  def should_resolve_tenant?
    false
  end
end
