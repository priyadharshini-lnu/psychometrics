# frozen_string_literal: true

module Administration
  module Campaigns
    class UniversalLinkPolicy < Administration::BasePolicy
      def show?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def enable?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def regenerate?
        @user.is?(:superadmin)
      end
    end
  end
end
