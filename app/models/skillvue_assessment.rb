# frozen_string_literal: true

class SkillvueAssessment < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'

  include Tenantable

  scope :filterable_fields, lambda { |query|
    where('product_id ILIKE :query OR name ILIKE :query', query: "%#{query}%")
  }
end
