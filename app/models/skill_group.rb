# frozen_string_literal: true

class SkillGroup < ApplicationRecord
  include RansackSearchableFields
  extend Mobility

  has_ancestry cache_depth: true

  belongs_to :project, class_name: 'Client', optional: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  has_many :skills

  validates :name, presence: true, uniqueness: { scope: :project_id }

  scope :end_level_groups, lambda { |_value = nil|
    joins('LEFT JOIN skill_groups AS children ON children.ancestry = CAST(skill_groups.id AS TEXT)').
      where(children: { id: nil })
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[end_level_groups]
  end

  def level_label
    TaxonomyLevel.
      find_by(hierarchy_type: 'skill_group', depth: ancestry_depth, project_id: project_id)&.
      label
  end
end
