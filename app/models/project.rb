# frozen_string_literal: true

class Project < Client
  has_many :project_licenses
  has_many :licenses, through: :project_licenses

  default_scope -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) }

  def self.ransackable_associations(_auth_object = nil)
    ['skills']
  end

  def self.ransackable_attributes(_auth_object = nil)
    ['id']
  end
end
