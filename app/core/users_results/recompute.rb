# frozen_string_literal: true

module UsersResults
  class Recompute < BaseCommand
    private_attr_reader :user_result, :user_assessment, :current_user, :allow_ai_rescore, :admin_job_record_id,
                        :force_ai_regenerate

    def initialize(user_result, current_user, allow_ai_rescore: false, admin_job_record_id: nil,
                   force_ai_regenerate: false)
      @user_result = user_result
      @user_assessment = user_result.user_assessment
      @current_user = current_user
      @admin_job_record_id = admin_job_record_id
      @allow_ai_rescore = allow_ai_rescore
      @force_ai_regenerate = force_ai_regenerate
    end

    def call
      return broadcast :ok unless user_assessment.completed?

      recompute_saville_assessment if user_assessment.saville?
      recompute_pearson_assessment if user_assessment.pearson?
      recompute_mettl_assessment if user_assessment.mettl?
      recompute_simulation_assessment if user_assessment.simulation?
      recompute_skillvue_assessment if user_assessment.skillvue?
      recompute_yoodli_assessment if user_assessment.yoodli?
      recompute_mhs_assessment if user_assessment.mhs?
      recompute_microsite_assessment if user_assessment.microsite?

      save_scores = UserAssessments::SaveScores.new(
        user_assessment, current_user,
        admin_job_record_id: admin_job_record_id,
        rescore: true,
        allow_ai_rescore: allow_ai_rescore,
        force_ai_regenerate: force_ai_regenerate
      )
      save_scores.on(:ok)      { broadcast :ok }
      save_scores.on(:waiting) { broadcast :waiting }
      save_scores.call
    end

    private

    def recompute_saville_assessment
      Saville::AssessmentOrderRequest.call!(user_assessment)
    end

    def recompute_pearson_assessment
      Pearson::SaveScoresAndReports.call!(user_assessment)
    end

    def recompute_mettl_assessment
      ::Mettl::SaveScoresAndReport.call!(user_assessment)
    end

    def recompute_simulation_assessment
      Simulation::SaveScoresAndReport.call!(user_assessment)
    end

    def recompute_skillvue_assessment
      Skillvue::SaveScoresAndReport.call!(user_assessment)
    end

    def recompute_yoodli_assessment
      Yoodli::ImportFromS3Service.call(user_assessment_id: user_assessment.id)
    end

    def recompute_mhs_assessment
      user_assessment.user_reports.find_each do |user_report|
        Mhs::SaveReportsAndScoresJob.perform_later(user_assessment, [user_report])
      end
    end

    def recompute_microsite_assessment
      microsite_user_assessment = user_assessment.microsite_user_assessment
      return unless microsite_user_assessment

      Microsite::FetchResults.call(microsite_user_assessment) do |result|
        result.on(:ok) do |results|
          Microsite::SaveAnswers.call(
            microsite_user_assessment,
            raw_answers: results[:responses],
            completed_at: results[:completed_at]
          )
        end

        result.on(:failed) do |error|
          Rails.logger.error("Microsite rescore failed: #{error}")
        end
      end
    end
  end
end
