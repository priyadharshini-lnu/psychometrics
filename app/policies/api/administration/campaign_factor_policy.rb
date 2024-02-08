# frozen_string_literal: true

module Api
  module Administration
    class CampaignFactorPolicy < ::Api::Administration::BasePolicy
      def index?
        @user.is?(:assessor) || has_permission?(:campaign_factors, :view)
      end

      def create?
        has_permission?(:campaign_factors, :manage)
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
          if @user.has_permission?(:campaign_factors, :view)
            scope
          else
            scope.where(public_visibility: true)
          end
        end
      end
    end
  end
end
