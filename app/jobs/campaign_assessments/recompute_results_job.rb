# frozen_string_literal: true

module CampaignAssessments
  class RecomputeResultsJob < ApplicationJob
    private_attr_reader :campaign_assessment, :current_user

    def perform(campaign_assessment, current_user)
      @campaign_assessment = campaign_assessment
      @current_user = current_user
      norm_data = {
        norm_id: campaign_assessment.norm_id,
        norm_type: campaign_assessment.norm_type
      }

      results.find_each do |res|
        ::UsersResults::Recompute.call!(res, current_user, norm_data)
      end
    end

    private

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
