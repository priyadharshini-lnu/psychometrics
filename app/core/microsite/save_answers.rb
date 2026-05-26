# frozen_string_literal: true

module Microsite
  class SaveAnswers < BaseCommand
    private_attr_reader :microsite_user_assessment, :raw_answers, :completed_at

    def initialize(microsite_user_assessment, raw_answers:, completed_at:)
      @microsite_user_assessment = microsite_user_assessment
      @raw_answers = raw_answers
      @completed_at = completed_at
    end

    def call
      save_raw_answers
      transform_and_save_answers
      mark_assessment_completed
      trigger_scoring

      broadcast :ok
    end

    private

    def save_raw_answers
      microsite_user_assessment.update!(
        answers: raw_answers,
        completed_at: completed_at
      )
    end

    def transform_and_save_answers
      ::Microsite::TransformAnswers.call(microsite_user_assessment) do |result|
        result.on(:ok) do |transformed_answers|
          users_result.update!(answers: transformed_answers)
        end

        result.on(:invalid) do |error|
          Rails.logger.error("Microsite::TransformAnswers failed: #{error}")
        end
      end
    end

    def mark_assessment_completed
      user_assessment.update!(
        status: :completed,
        completed_at: microsite_user_assessment.completed_at || Time.current
      )
    end

    def trigger_scoring
      ::UsersResults::SaveScoringWithCallbacksJob.perform_later(users_result, user_assessment.user)
    end

    def user_assessment
      @user_assessment ||= microsite_user_assessment.user_assessment
    end

    def users_result
      @users_result ||= user_assessment.users_result
    end
  end
end
