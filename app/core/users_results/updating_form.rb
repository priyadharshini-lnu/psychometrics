# frozen_string_literal: true

module UsersResults
  class UpdatingForm < Rectify::Form
    attribute :status, Integer
    attribute :embedded_data, Hash, default: nil
    attribute :norm_id, Integer, default: nil
    attribute :answers, Hash, default: nil
    attribute :step, Integer
    attribute :current_element
    attribute :current_page
    attribute :last_activity_at, DateTime
  end
end
