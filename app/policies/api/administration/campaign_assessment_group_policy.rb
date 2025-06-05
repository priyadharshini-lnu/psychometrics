# frozen_string_literal: true

module Api
  module Administration
    class CampaignAssessmentGroupPolicy < BasePolicy
      def index?
        has_permission?(:workshops, :manage)
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope.where(campaign_id: campaign_id)
        end
      end
    end
  end
end
