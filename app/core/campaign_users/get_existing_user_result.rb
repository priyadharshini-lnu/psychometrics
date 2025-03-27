# frozen_string_literal: true

module CampaignUsers
  class GetExistingUserResult < BaseCommand
    private_attr_reader :campaign_user, :project_id, :assessment

    def initialize(campaign_user, assessment, project_id)
      @campaign_user = campaign_user
      @assessment = assessment
      @project_id = project_id
    end

    def call
      evaluation_results = fetch_existing_user_result

      broadcast :ok, latest_result(evaluation_results)
    end

    private

    def fetch_existing_user_result
      results = campaign_user.evaluation_results.joins(:user_assessment)

      return filter_by_hogan_credential(results) if assessment.hogan?

      filter_by_validity_period(results)
    end

    def filter_by_hogan_credential(results)
      return results.none unless existing_hogan_credential

      results.joins(user_assessment: :hogan_credential).
        where(hogan_credential: { id: existing_hogan_credential.id })
    end

    def filter_by_validity_period(results)
      results.where('user_assessments.completed_at >= ? OR user_assessments.completed_at IS NULL',
                    validity_period.days.ago)
    end

    def latest_result(results)
      results.order(created_at: :desc).
        find_by(user_assessments: { assessment_id: assessment.id })
    end

    def validity_period
      @validity_period ||= assessment.score_validity_period(project_id: project_id)
    end

    def existing_hogan_credential
      @existing_hogan_credential ||= campaign_user.user.hogan_credential
    end
  end
end
