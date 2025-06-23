# frozen_string_literal: true

class SkillsJobRole < ApplicationRecord
  include RansackSearchableFields

  belongs_to :skill
  belongs_to :job_role

  validates :expected_proficiency_level, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  scope :global, lambda { |_value = nil|
    joins(:skill, :job_role).
      where(skills: { project_id: nil }, job_roles: { project_id: nil })
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id expected_proficiency_level skill_id job_role_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[job_role skill]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[global filterable_fields]
  end
end
