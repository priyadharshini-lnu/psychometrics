# frozen_string_literal: true

module Administration
  module Threesixty
    class SubjectPolicy < BasePolicy
      def index?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def spoof?
        user.is?(:superadmin)
      end

      def import?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def allow_results_delete?
        has_permission?(:results, :reset_responses)
      end

      def manage_datasheets?
        user.is?(:superadmin) || user.has_permission?(:datasheets, :manage, project_id: project_id)
      end

      def approve_report?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def remove_report_approval?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def release_report?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def hold_report?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def remove_report_hold_release?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def mark_as_done?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def unmark_as_done?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage, project_id: project_id)
      end

      def export_results?
        has_permission?(:results, :raw_responses)
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
        has_permission?(:campaigns, :reset_nominations)
      end

      def edit_user?
        user.is?(:superadmin) || user.has_permission?(:projects, :manage_users, project_id: project_id)
      end

      def view_report?
        user.is?(:superadmin) || user.has_permission?(:results, :view_report, project_id: project_id)
      end

      def download_report?
        has_permission?(:results, :download_report)
      end

      def regenerate_report?
        user.is?(:superadmin) || user.has_permission?(:results, :regenerate_report, project_id: project_id)
      end

      def view_responses?
        user.is?(:superadmin) || user.has_permission?(:results, :raw_responses, project_id: project_id)
      end

      def remove_subject?
        user.is?(:superadmin) || user.has_permission?(:projects, :manage_users, project_id: project_id)
      end

      def remove_from_campaign?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def create_all?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def search?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def preview_report?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def download_example_import_file?
        user.is?(:superadmin) || user.has_permission?(:campaigns, :view, project_id: project_id)
      end
    end
  end
end
