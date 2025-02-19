# frozen_string_literal: true

class Project < Client
  default_scope -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) }

  def self.ransackable_associations(_auth_object = nil)
    ['skills']
  end

  def self.ransackable_attributes(_auth_object = nil)
    ['id']
  end
end
