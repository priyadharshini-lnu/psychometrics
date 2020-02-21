# frozen_string_literal: true

class AssignForm < Rectify::Form
  attribute :status, Integer
  attribute :results, Hash, default: nil
  attribute :embedded_data, Hash, default: nil
  attribute :norm_data, Hash, default: nil
  attribute :step, Integer, default: 0
  attribute :current_element, String, default: 0
  attribute :current_page, Integer, default: 0
end
