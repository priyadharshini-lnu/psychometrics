# frozen_string_literal: true

class JobRole < ApplicationRecord
  extend Mobility

  translates :name, :description

  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :job_group, optional: true

  has_many :skills_job_roles
  has_many :skills, through: :skills_job_roles

  validates :name, presence: true, uniqueness: { scope: :job_group_id }

  scope :global, ->(_value = nil) { where(project_id: nil) }
  scope :all_job_roles, ->(_value = nil) { all }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name code project_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[job_group project skills]
  end

  def self.ransackable_scopes(_auth_object = nil)
    %w[global filterable_fields]
  end
end
