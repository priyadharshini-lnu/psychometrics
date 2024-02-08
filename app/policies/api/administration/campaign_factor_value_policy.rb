# frozen_string_literal: true

module Api
  module Administration
    class CampaignFactorValuePolicy < ::Api::Administration::BasePolicy
      def index?
        @user.is?(:assessor) || has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        )
      end

      def save_assessor_scoring_factor_value?
        @user.is?(:assessor)
      end

      class Scope < ::Api::Administration::BasePolicy::Scope
        def resolve
          if @user.has_permission?(:results, :scores, project_id: project_id, campaign_id: campaign_id)
            scope.where(campaign_id: campaign_id)
          else
            user_id_where_current_user_is_lead_assessor =
              ::UserAssessments::GetLeadUserAssessmentsForAssessor.call!(campaign_id, @user).select(:subject_id)

            scope.where(campaign_id: campaign_id, user_id: user_id_where_current_user_is_lead_assessor)
          end
        end
      end
    end
  end
end
