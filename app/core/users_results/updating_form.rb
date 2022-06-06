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

    validate :check_status

    def norm_id
      norm_data.dig(:id)&.to_i
    end

    def attributes
      super.except(:norm_data)
    end

    def check_status
      return if context.user_result.in_progress?

      errors.add(:status, 'invalid status to update')
    end
  end
end
