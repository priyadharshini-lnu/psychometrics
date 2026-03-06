# frozen_string_literal: true

module UserAssessments
  class SaveScores < BaseCommand
    attr_reader :user_assessment, :user_result, :current_user, :rescore, :admin_job_record_id

    def initialize(user_assessment, current_user = nil, rescore: false, admin_job_record_id: nil)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @current_user = current_user
      @rescore = rescore
      @admin_job_record_id = admin_job_record_id
    end

    def call
      return broadcast :ok unless user_result.completed?

      transaction do
        if user_result.assessment.agile?
          user_result.update!(
            scoring: ::UsersResults::CalculateAgileScoring.call!(user_result)
          )
        elsif user_assessment.external?
          user_result.update!(scoring: ::UsersResults::CalculateScoring.call!(user_result))
          user_assessment.generate_campaign_scoring_and_artifacts_results if user_assessment.score_calculated?
        else
          user_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(user_result)
          user_result.scoring = ::UsersResults::CalculateScoring.call!(user_result) if user_result.completed?
          user_result.occupations = ::UsersResults::CalculateOccupations.call!(user_result)
          user_result.innovation_styles = ::UsersResults::CalculateInnovationStyles.call!(user_result)
          user_result.save!
        end
      end

      if user_result.assessment.has_ai_questions?
        trigger_ai_scoring_job
      else
        complete_scoring_without_ai
      end
    end

    private

    def trigger_ai_scoring_job
      AI::ContentAnalysis::TriggerAIScoringJob.perform_later(
        user_result.id,
        rescore: rescore,
        admin_job_record_id: admin_job_record_id
      )
      broadcast :waiting
    end

    def complete_scoring_without_ai
      user_assessment.auto_approve_scoring!
      PostScoringTasks.call!(user_assessment, current_user, rescore: rescore)
      broadcast :ok
    end
  end
end
