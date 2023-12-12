# frozen_string_literal: true

module Api
  module Administration
    class CampaignFactorGroupPolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?(:campaign_factors, :view)
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
    end
  end
end
