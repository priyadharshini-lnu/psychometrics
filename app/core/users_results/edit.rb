# frozen_string_literal: true

module UsersResults
  class Edit < BaseCommand
    private_attr_reader :users_result

    def initialize(users_result)
      @users_result = users_result
    end

    def call
      transaction do
        reset_user_result
      end

      broadcast :ok
    end

    private

    def set_answers_as_dirty
      users_result.answers.each { |_, r| r[:dirty] = true }
    end

    def reset_user_result
      users_result.update_attributes(
        answers: set_answers_as_dirty,
        scoring: nil,
        occupations: nil,
        embedded_data: nil,
        status: UsersResult.statuses[:in_progress],
        completed_at: nil,
        step: 0,
        norm_id: nil,
        meta_data: {},
        current_element: nil,
        current_page: 0,
        completion_reason: nil,
        prev_pages: [],
        progress: 0
      )
    end
  end
end
