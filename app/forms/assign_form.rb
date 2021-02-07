# frozen_string_literal: true

class AssignForm < Rectify::Form
  attribute :status, Integer
  attribute :results, Hash, default: nil
  attribute :embedded_data, Hash, default: nil
  attribute :norm_data, Hash, default: nil
  attribute :step, Integer
  attribute :current_element, String
  attribute :current_page, Integer
  attribute :last_activity_at, DateTime
  attribute :prev_pages, Array, default: []
end
