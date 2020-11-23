# frozen_string_literal: true

module AdminJobs
  class RescoreAssessment < AdminJobs::Base
    def call
      norm_data = {
        norm_id: campaign_assessment.norm_id,
        norm_type: campaign_assessment.norm_type
      }

      results.find_each do |res|
        ::UsersResults::Recompute.call!(res, owner, norm_data)
      end
      broadcast :ok
    end

    private

    def campaign_assessment
      @campaign_assessment ||= CampaignAssessment.find(record.data['campaign_assessment_id'])
    end

    def results
      UsersResult.joins(:user_assessment).
        where(
          assessment_id: campaign_assessment.assessment_id,
          user_assessments: { campaign_id: campaign_assessment.campaign_id },
          status: :completed
        ).
        includes(:evaluator)
    end
  end
end
