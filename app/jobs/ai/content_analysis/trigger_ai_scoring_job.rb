# frozen_string_literal: true

module AI
  module ContentAnalysis
    class TriggerAIScoringJob < ApplicationJob
      include AdminJobs::Concerns::Syncable

      queue_as :default

      private attr_reader :users_result, :admin_job_record_id

      def perform(users_result_id, rescore: false, force_regenerate: false, admin_job_record_id: nil)
        @users_result = UsersResult.find(users_result_id)
        @admin_job_record_id = admin_job_record_id

        return unless users_result.assessment.has_ai_questions?

        unless should_process?(rescore)
          complete_admin_job!
          return
        end

        mark_as_pending!
        unless users_result.ready_for_ai_scoring?
          complete_admin_job!
          return
        end

        scorable_questions.find_each do |question|
          ScoreQuestionJob.perform_later(
            users_result.id,
            question.id,
            rescore: rescore,
            force_regenerate: force_regenerate,
            admin_job_record_id: admin_job_record_id
          )
        end
      end

      private

      def scorable_questions
        @scorable_questions ||= users_result.assessment.scorable_ai_questions
      end

      def should_process?(rescore)
        return false unless users_result.ai_content_analysis_enabled?
        return false unless users_result.completed?
        return false if users_result.ai_scoring_processing? && !rescore
        return false if users_result.ai_scoring_completed? && !rescore
        return false if users_result.ai_scoring_approved?

        true
      end

      def mark_as_pending!
        return if users_result.ai_scoring_pending?

        users_result.ai_scoring_pending!
      end
    end
  end
end
