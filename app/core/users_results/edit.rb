# frozen_string_literal: true

module UsersResults
  class Edit < BaseCommand
    private_attr_reader :users_result, :user_assessment

    def initialize(users_result)
      @users_result = users_result
      @user_assessment = users_result.user_assessment
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
      user_assessment.update!(
        status: UserAssessment.statuses[:not_started],
        completed_at: nil,
        completion_reason: nil,
        norm_id: nil,
        norm_type: nil
      )
      users_result.update!(
        answers: set_answers_as_dirty,
        scoring: nil,
        occupations: nil,
        embedded_data: nil,
        step: 0,
        meta_data: {},
        current_element: nil,
        current_page: 0,
        prev_pages: [],
        progress: 0
      )
    end
  end
end
