# frozen_string_literal: true

module AI
  module ContentAnalysis
    class SyncScoringStatus < BaseCommand
      include AdminJobs::Concerns::Syncable

      private_attr_reader :users_result, :rescore, :admin_job_record_id

      def initialize(users_result, rescore: false, admin_job_record_id: nil)
        @users_result = users_result
        @rescore = rescore
        @admin_job_record_id = admin_job_record_id
      end

      def call
        users_result.with_lock do
          new_status = determine_overall_status

          return broadcast :ok, new_status if status_unchanged?(new_status)

          update_status!(new_status)
          save_scores_if_completed!(new_status)
          fail_admin_job!(["AI Scoring failed for UsersResult #{users_result.id}"]) if new_status == :failed

          broadcast :ok, new_status
        end
      end

      private

      def determine_overall_status
        return :failed if any_session_failed?
        return :completed if all_sessions_completed?

        :processing
      end

      def any_session_failed?
        scoring_sessions.exists?(status: :failed)
      end

      def all_sessions_completed?
        completed_count = scoring_sessions.where(status: :completed).count
        completed_count >= scorable_question_ids.count
      end

      def status_unchanged?(new_status)
        users_result.ai_scoring_status == new_status.to_s
      end

      def update_status!(new_status)
        users_result.update!(ai_scoring_status: new_status)
      end

      def save_scores_if_completed!(status)
        return unless status == :completed

        SaveAIFactorScores.call(users_result, rescore: rescore, admin_job_record_id: admin_job_record_id)
      end

      def scoring_sessions
        @scoring_sessions ||= AI::QuestionScoringSession.where(
          resource: users_result.user_assessment,
          assistable_type: 'Question',
          assistable_id: scorable_question_ids
        )
      end

      def scorable_question_ids
        @scorable_question_ids ||= users_result.assessment.scorable_ai_questions.pluck(:id)
      end
    end
  end
end
