# frozen_string_literal: true

class SkillsJobRole < ApplicationRecord
  belongs_to :skill
  belongs_to :job_role
  belongs_to :project, class_name: 'Client'

  include Tenantable

  validates :expected_proficiency_level, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  scope :global, ->(_value = nil) { where(project_id: nil) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id expected_proficiency_level skill_id job_role_id project_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[job_role skill]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[global filterable_fields]
  end
end
