# frozen_string_literal: true

class PearsonAssessment < ApplicationRecord
  scope :filterable_fields, lambda { |query|
    where('product_id ILIKE :query OR title ILIKE :query', query: "%#{query}%")
  }
end
