# frozen_string_literal: true

module AI
  module ContentAnalysis
    class ScoreQuestionJob < ApplicationJob
      include Concerns::TransientErrorHandler

      queue_as :default

      retry_on(*transient_errors, wait: ->(executions) { (15 * (3**executions)).seconds }, attempts: 4)

      sidekiq_throttle(
        concurrency: { limit: 5 },
        threshold: { limit: 15, period: 1.minute }
      )

      private attr_reader :users_result, :question, :admin_job_record_id

      def perform(users_result_id, question_id, rescore: false, force_regenerate: false, admin_job_record_id: nil)
        @users_result = UsersResult.find(users_result_id)
        @question = Question.includes(:factors_scorings).find(question_id)
        @admin_job_record_id = admin_job_record_id

        ScoreQuestion.call!(
          question,
          users_result,
          rescore: rescore,
          force_regenerate: force_regenerate
        )
        SyncScoringStatus.call!(users_result, rescore: rescore, admin_job_record_id: admin_job_record_id)
      end
    end
  end
end
