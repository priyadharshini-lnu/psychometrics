# frozen_string_literal: true

module UsersResults
  class UpdatingForm < Rectify::Form
    attribute :status, Integer
    attribute :embedded_data, Hash, default: nil
    attribute :norm_id, Integer, default: nil
    attribute :norm_data, Hash, default: {}
    attribute :answers, Hash, default: nil
    attribute :step, Integer
    attribute :current_element
    attribute :current_page
    attribute :last_activity_at, DateTime
    attribute :completion_reason, String, default: 'user_completed'
    attribute :prev_pages, Array, default: []
    attribute :progress, Integer
    attribute :completion_status_code, String, default: nil

    def norm_id
      norm_data[:id]&.to_i
    end

    def attributes
      super.except(:norm_data)
    end
  end
end
