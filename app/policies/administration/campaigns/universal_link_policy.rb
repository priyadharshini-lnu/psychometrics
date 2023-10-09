# frozen_string_literal: true

module Administration
  module Campaigns
    class UniversalLinkPolicy < Administration::BasePolicy
      def show?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def activate?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def destroy?
        @user.is?(:superadmin)
      end

      def toggle_multiple_responses?
        @user.is?(:superadmin)
      end
    end
  end
end
