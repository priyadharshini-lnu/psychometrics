# frozen_string_literal: true

# Per-user configuration, optionally resource-scoped; the jsonb payload is schemaless — each category owns its shape.
class UserPreference < ApplicationRecord
  belongs_to :user
  belongs_to :resource, polymorphic: true, optional: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :user

  CATEGORIES = {
    workspace: 'workspace',
    theme: 'theme',
    favorite: 'favorite',
    tour: 'tour',
    table_settings: 'table_settings'
  }.freeze

  validates :config_key, presence: true
  validates :category, presence: true, inclusion: { in: CATEGORIES.values }
  # jsonb defaults to {}, which is blank — a preference must carry a real payload.
  validates :payload, presence: true
  validates :config_key, uniqueness: { scope: %i[user_id category resource_type resource_id] }

  scope :by_category, ->(category) { where(category: category) }
  # `next all` (not an if modifier) keeps the scope chainable on a blank query.
  scope :search, lambda { |query|
    next all if query.blank?

    where('name ILIKE :q OR description ILIKE :q', q: "%#{query}%")
  }
end
