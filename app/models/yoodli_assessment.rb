# frozen_string_literal: true

class YoodliAssessment < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'

  scope :filterable_fields, lambda { |query|
    where('product_id ILIKE :query OR name ILIKE :query', query: "%#{query}%")
  }

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name product_id project_id created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[project]
  end
end
