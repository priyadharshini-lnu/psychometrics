# frozen_string_literal: true

module UserAssessments
  class SaveScores < BaseCommand
    attr_reader :user_assessment, :user_result, :current_user, :rescore, :allow_ai_rescore, :admin_job_record_id,
                :force_ai_regenerate

    def initialize(user_assessment, current_user = nil, **options)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @current_user = current_user
      @rescore = options.fetch(:rescore, false)
      @allow_ai_rescore = options.fetch(:allow_ai_rescore, false)
      @admin_job_record_id = options[:admin_job_record_id]
      @force_ai_regenerate = options.fetch(:force_ai_regenerate, false)
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
          user_result.occupation_condition_set = user_result.resolve_occupation_condition_set
          user_result.occupations = ::UsersResults::CalculateOccupations.call!(user_result)
          user_result.innovation_styles = ::UsersResults::CalculateInnovationStyles.call!(user_result)
          user_result.save!
        end
      end

      if should_trigger_ai_scoring?
        trigger_ai_scoring_job
      else
        complete_scoring_without_ai
      end
    end

    private

    def should_trigger_ai_scoring?
      return false unless user_result.assessment.has_ai_questions?
      return false if rescore && !allow_ai_rescore
      return false if user_assessment.ai_scoring_approved?

      true
    end

    def trigger_ai_scoring_job
      AI::ContentAnalysis::TriggerAIScoringJob.perform_later(
        user_result.id,
        rescore: rescore,
        force_regenerate: force_ai_regenerate,
        admin_job_record_id: admin_job_record_id
      )
      broadcast :waiting
    end

    def complete_scoring_without_ai
      auto_approve_if_no_approval_flow!
      merge_ai_scores_if_needed!

      PostScoringTasks.call!(user_assessment, current_user, rescore: rescore)
      broadcast :ok
    end

    def auto_approve_if_no_approval_flow!
      return if user_assessment.has_ai_scoring_approval_flow?
      return if user_assessment.approval_status == 'auto_approved'

      user_assessment.auto_approve_scoring!
    end

    def merge_ai_scores_if_needed!
      if !allow_ai_rescore && user_result.assessment.has_ai_questions?
        ::UsersResults::Scoring::MergeAIScores.call!(user_result, skip_post_scoring_tasks: true)
      end
    end
  end
end
