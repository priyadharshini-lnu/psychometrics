# frozen_string_literal: true

module Api
  module Administration
    class CampaignScoringVariablePolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?(:campaign_factors, :manage)
      end

      def update?
        has_permission?(:campaign_factors, :manage)
      end
    end
  end
end
