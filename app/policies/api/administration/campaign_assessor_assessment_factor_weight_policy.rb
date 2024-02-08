# frozen_string_literal: true

module Api
  module Administration
    class CampaignAssessorAssessmentFactorWeightPolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?(:campaign_factors, :view) ||
          ::UserAssessments::GetLeadUserAssessmentsForAssessor.call!(campaign_id, @user).exists?
      end

      def bulk_upsert?
        has_permission?(:campaign_factors, :manage)
      end
    end
  end
end
