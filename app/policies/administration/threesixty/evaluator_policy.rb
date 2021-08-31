# frozen_string_literal: true

module Administration
  module Threesixty
    class EvaluatorPolicy < BasePolicy
      def manage_datasheets?
        user.is?(:superadmin) || user.has_permission?(:datasheets, :manage, project_id: project_id)
      end

      def manage_relationships?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def export_results?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def export_completion_status?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def edit_dimension?
        user.is?(:superadmin) || user.has_permission?(:dimensions, :manage, project_id: project_id)
      end

      def reset_all_participants?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def reset_all_nominations?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def index?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def import?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def spoof?
        user.is?(:superadmin)
      end

      def edit?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def remove_from_campaign?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def create_all?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def download_example_import_file?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end
    end
  end
end
