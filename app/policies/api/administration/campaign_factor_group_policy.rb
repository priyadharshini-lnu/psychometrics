# frozen_string_literal: true

module Api
  module Administration
    class CampaignFactorGroupPolicy < ::Api::Administration::BasePolicy
      def index?
        @user.is?(:assessor) || has_permission?(:campaign_factors, :view)
      end

      def create?
        has_permission?(:campaign_factors, :manage)
      end

      def initialize_scoring?
        create?
      end

      def update?
        has_permission?(:campaign_factors, :manage)
      end

      def update_positions?
        update?
      end

      def destroy?
        has_permission?(:campaign_factors, :manage)
      end

      class Scope < ::Api::Administration::BasePolicy::Scope
        def resolve
          if @user.has_permission?(:results, :scores, campaign_id: campaign_id) ||
             @user.has_permission?(:campaign_factors, :view, campaign_id: campaign_id) ||
             ::UserAssessments::GetLeadUserAssessmentsForAssessor.call!(campaign_id, @user).exists?
            scope.where(campaign_id: campaign_id)
          else
            scope.none
          end
        end
      end
    end
  end
end
