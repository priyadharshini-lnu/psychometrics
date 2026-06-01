# frozen_string_literal: true

class ProficiencyLevel < ApplicationRecord
  extend Mobility

  translates :level_definition

  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :skill

  tenant_config has_global_records: true, optional: true
  include Tenantable

  enum :proficiency_type, {
    default: 0,
    by_skill_type: 1,
    by_skill: 2
  }

  enum :skill_type, { behavioral: 0, technical: 1, other: 2, qualification: 3 }

  MIN_LEVEL = 2
  MAX_LEVEL = 10

  validates :proficiency_type, presence: true
  validates :level, presence: true
  validates :level_definition, presence: true

  scope :global, ->(_value = nil) { where(project_id: nil) }
  scope :filterable_fields, lambda { |query|
    query = "%#{query}%"

    proficiency_case_sql = enum_case_sql('proficiency_levels.proficiency_type', proficiency_types)
    skill_type_case_sql = enum_case_sql('proficiency_levels.skill_type', skill_types)

    left_joins(:skill).where(
      sanitize_sql_array([
        "#{proficiency_case_sql} ILIKE :query
        OR REPLACE(#{proficiency_case_sql}, '_', ' ') ILIKE :query
        OR REPLACE(#{skill_type_case_sql}, '_', ' ') ILIKE :query
        OR COALESCE(skills.name, '') ILIKE :query", { query: query }
      ])
    )
  }

  def self.enum_case_sql(column, enum_hash)
    cases = enum_hash.map { |key, value| "WHEN #{value} THEN '#{key}'" }.join(' ')
    "CASE #{column} #{cases} END"
  end

  ransacker :proficiency_type, formatter: proc { |v| proficiency_types[v] } do |parent|
    parent.table[:proficiency_type]
  end

  ransacker :skill_type, formatter: proc { |v| skill_types[v] } do |parent|
    parent.table[:skill_type]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[
      proficiency_type
      skill_type
      skill_id
      level
      level_definition
      project_id
    ]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[project skill]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields global]
  end
end
