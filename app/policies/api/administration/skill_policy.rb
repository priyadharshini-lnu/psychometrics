# frozen_string_literal: true

module Api
  module Administration
    class SkillPolicy < Administration::BasePolicy
      def index?
        has_permission?('skills', 'view', project_id: project_id)
      end

      def create?
        has_permission?('skills', 'manage', project_id: project_id)
      end

      def update?
        has_permission?('skills', 'manage', project_id: project_id)
      end

      def destroy?
        has_permission?('skills', 'manage', project_id: project_id)
      end

      def show?
        has_permission?('skills', 'view', project_id: project_id)
      end

      def search?
        has_permission?('skills', 'view', project_id: project_id)
      end

      def proficiency_levels?
        has_permission?('skills', 'view', project_id: project_id)
      end

      def tags_search?
        search?
      end

      def add_tag?
        has_permission?('skills', 'manage', project_id: project_id)
      end

      def remove_tag?
        has_permission?('skills', 'manage', project_id: project_id)
      end

      def import?
        has_permission?('skills', 'import', project_id: project_id)
      end

      def import_translations?
        has_permission?('skills', 'import_translations', project_id: project_id)
      end

      def export_translations?
        has_permission?('skills', 'export_translations', project_id: project_id)
      end

      def export?
        has_permission?('skills', 'export', project_id: project_id)
      end

      def import_global?
        @user.is?(:superadmin)
      end

      def export_global?
        @user.is?(:superadmin)
      end

      def import_global_translations?
        @user.is?(:superadmin)
      end

      def export_global_translations?
        @user.is?(:superadmin)
      end

      def generate_embedding?
        @user.is?(:superadmin)
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope = super.includes(:translations)
          return scope if @user.superadmin?

          permitted_client_admin_project_ids = @user.client_admin_project_ids.select do |project_id|
            @user.has_permission?(:skills, :view, project_id: project_id)
          end

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?(:skills, :view, project_id: project_id)
          end

          permitted_campaign_admin_project_ids = @user.campaign_admin_campaigns.select do |campaign|
            @user.has_permission?(:skills, :view, project_id: campaign.project_id)
          end

          accessible_project_ids = permitted_client_admin_project_ids +
                                   permitted_project_admin_project_ids +
                                   permitted_campaign_admin_project_ids

          if ProjectFeature.exists?(global_skills: true, project_id: accessible_project_ids)
            scope.where(project_id: [nil, *accessible_project_ids])
          else
            scope.where(project_id: accessible_project_ids)
          end
        end
      end
    end
  end
end
