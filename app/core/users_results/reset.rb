# frozen_string_literal: true

module UsersResults
  class Reset < BaseCommand
    private_attr_reader :user_assessment, :users_result

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @users_result = user_assessment.users_result
    end

    def call
      transaction do
        Iiht::AllowAttempts.call!(user_assessment) if user_assessment.iiht?
        remove_reports if user_assessment.completed?
        reset_user_result
        remove_media_responses
        remove_ai_translation
        remove_ai_scores
        Saville::ResetAssessment.call!(user_assessment) if user_assessment.saville?
        Mettl::ResetCandidateAssessment.call!(user_assessment) if user_assessment.mettl?
        Simulation::ResetAssessment.call!(user_assessment) if user_assessment.simulation?
        Skillvue::ResetAssessment.call!(user_assessment) if user_assessment.skillvue?
        Yoodli::ResetAssessment.call!(user_assessment) if user_assessment.yoodli?
        Mhs::ResetAssessment.call!(user_assessment) if user_assessment.mhs?
        Microsite::ResetAssessment.call!(user_assessment) if user_assessment.microsite?
      end

      broadcast :ok
    end

    private

    def reset_user_result
      user_assessment.update!(
        status: UserAssessment.statuses[:not_started],
        completed_at: nil,
        completion_reason: nil,
        norm_id: user_assessment.fixed_norm? ? user_assessment.norm_id : nil,
        reset_count: user_assessment.reset_count + 1,
        expiry_date: nil,
        selected_locale: nil,
        additional_time: nil,
        started_at: nil,
        last_activity_at: nil,
        manager_evaluation_status: :waiting,
        evaluator_nomination_status: :waiting,
        completion_status_code: nil,
        evaluation_session_id: nil,
        score_calculated: false,
        score_calculated_at: nil,
        approval_status: nil,
        approval_status_updated_at: nil,
        score_assessed_by_id: nil,
        score_approved_by_id: nil,
        score_assessed_at: nil,
        score_approved_at: nil
      )
      users_result.generate_randomseed
      users_result.update!(
        answers: {},
        scoring: nil,
        occupations: nil,
        external_results: nil,
        embedded_data: nil,
        step: 0,
        meta_data: {},
        current_element: nil,
        current_page: nil,
        prev_pages: [],
        progress: 0,
        ai_scoring_status: nil
      )
    end

    def remove_media_responses
      MediaResponse.where(users_result_id: users_result.id).destroy_all
    end

    def remove_ai_translation
      AI::TranslationResult.where(translatable_type: 'UserReport', translatable_id: user_reports.ids).destroy_all
    end

    def remove_reports
      user_reports.find_each(&:remove_all_report_pdfs!)
    end

    def remove_ai_scores
      remove_ai_factor_scores
      remove_ai_question_scoring_sessions
    end

    def remove_ai_factor_scores
      AI::FactorScore.where(users_result_id: users_result.id).destroy_all
    end

    def remove_ai_question_scoring_sessions
      AI::QuestionScoringSession.where(resource_id: user_assessment.id, resource_type: 'UserAssessment').destroy_all
    end

    def user_reports
      UserReport.where(
        report_id: users_result.assessment.report_ids,
        user_id: user_assessment.subject_id,
        campaign_id: user_assessment.campaign_id
      )
    end
  end
end
