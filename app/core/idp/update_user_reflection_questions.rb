# frozen_string_literal: true

module Idp
  class UpdateUserReflectionQuestions < BaseCommand
    attr_accessor :user_idp_skill, :reflection_questions_params

    def initialize(user_plan, reflection_questions_params)
      @user_plan = user_plan
      @reflection_questions_params = reflection_questions_params
    end

    def call
      return broadcast :ok, false if @user_plan.completion_status_completed?

      UserIdpPlan.transaction do
        reflection_questions_params.each do |reflection_question|
          @user_plan.user_reflection_question_answers.find_or_initialize_by(
            reflection_question_id: reflection_question[:id]
          ).update!(
            answer: reflection_question[:answer].presence
          )
        end
      end
      broadcast :ok, true
    end
  end
end
