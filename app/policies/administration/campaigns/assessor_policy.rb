# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(
          :assessors, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def available_assessments?
        @user.is?(:superadmin) || @user.has_permission?(
          :assessors, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def create_all?
        @user.is?(:superadmin) || @user.has_permission?(
          :workshops, :manage, project_id: project_id, campaign_id: campaign_id
        ) || (
          @user.has_permission?(:assessors, :manage, project_id: project_id, campaign_id: campaign_id) &&
          @user.has_permission?(:campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id)
        )
      end

      def destroy?
        @user.is?(:superadmin) || (
          @user.has_permission?(:assessors, :manage, project_id: project_id, campaign_id: campaign_id) &&
          @user.has_permission?(:campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id)
        )
      end

      def import?
        @user.is?(:superadmin) || (
          @user.has_permission?(:assessors, :manage, project_id: project_id, campaign_id: campaign_id) &&
          @user.has_permission?(:campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id)
        )
      end

      def show?
        @user.is?(:superadmin) || @user.has_permission?(
          :assessors, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def user_assessments?
        @user.is?(:superadmin) || @user.has_permission?(
          :assessors, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def reset_evaluation?
        @user.is?(:superadmin) || (
          @user.has_permission?(:assessors, :manage, project_id: project_id, campaign_id: campaign_id) &&
          @user.has_permission?(:campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id)
        )
      end

      def add_subject?
        @user.is?(:superadmin) || (
          @user.has_permission?(:assessors, :manage, project_id: project_id, campaign_id: campaign_id) &&
          @user.has_permission?(:campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id)
        )
      end
    end
  end
end
