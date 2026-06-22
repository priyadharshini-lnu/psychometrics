# frozen_string_literal: true

class TaxonomyLevel < ApplicationRecord
  extend Mobility

  belongs_to :project, class_name: 'Client', optional: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  validates :hierarchy_type, presence: true, inclusion: { in: %w[job_group skill_group] }
  validates :depth, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :label, presence: true
  validates :project_id, uniqueness: { scope: %i[hierarchy_type depth] }
end
