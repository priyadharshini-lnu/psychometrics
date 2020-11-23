# frozen_string_literal: true

module UsersResults
  class UpdatingForm < Rectify::Form
    attribute :status, Integer
    attribute :embedded_data, Hash, default: nil
    attribute :norm_id, Integer, default: nil
    attribute :norm_type, Integer, default: nil
    attribute :norm_data, Hash, default: {}
    attribute :answers, Hash, default: nil
    attribute :step, Integer
    attribute :current_element
    attribute :current_page
    attribute :last_activity_at, DateTime
    attribute :completion_reason, String, default: 'user_completed'
    attribute :prev_pages, Array, default: []

    def norm_id
      norm_data.dig(:id)&.to_i
    end

    def norm_type
      norm_data.dig(:type)
    end

    def attributes
      super.except(:norm_data)
    end
  end
end
