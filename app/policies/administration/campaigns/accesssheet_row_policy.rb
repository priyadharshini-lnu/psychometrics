# frozen_string_literal: true

module Administration
  module Campaigns
    class AccesssheetRowPolicy < Administration::BasePolicy
      def bulk_delete?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def create?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def edit?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def index?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def show?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def update?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def destroy?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def save_column_preference?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def import?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      def export?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end

      private

      def manage?
        @user.is?(:superadmin) || @user.has_permission?(
          :datasheets, :manage, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
