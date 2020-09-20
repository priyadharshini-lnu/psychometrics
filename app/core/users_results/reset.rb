# frozen_string_literal: true

module UsersResults
  class Reset < BaseCommand
    private_attr_reader :user_assessment, :users_result

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @users_result = user_result
    end

    def call
      transaction do
        remove_reports if user_result.completed?
        reset_user_result
        remove_media_responses
        update_users_result_id_on_assessment
      end

      broadcast :ok
    end

    private

    def user_result
      result = user_assessment.users_result
      if result&.user_assessments&.length == 1
        result
      else
        result.dup
      end
    end

    def reset_user_result
      users_result.assign_attributes(
        answers: {},
        scoring: nil,
        occupations: nil,
        embedded_data: nil,
        status: UsersResult.statuses[:not_started],
        completed_at: nil,
        step: 0,
        norm_id: nil,
        norm_type: nil,
        expiry_date: nil,
        last_activity_at: nil,
        meta_data: {},
        additional_time: nil,
        current_element: nil,
        current_page: nil
      )
      users_result.save
    end

    def remove_media_responses
      existing_user_result_record? && MediaResponse.where(users_result_id: user_result.id).destroy_all
    end

    def update_users_result_id_on_assessment
      unless existing_user_result_record?
        user_assessment.update(
          users_result_id: users_result.id
        )
      end
    end

    def existing_user_result_record?
      user_assessment.users_result_id == users_result.id
    end

    def remove_reports
      user_result.update!(remove_pdf: true, status: :not_prepared)
    end
  end
end
