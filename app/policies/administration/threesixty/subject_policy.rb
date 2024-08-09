# frozen_string_literal: true

module Administration
  module Threesixty
    class SubjectPolicy < BasePolicy
      def index?
        has_permission?(:campaigns, :view)
      end

      def spoof?
        user.is?(:superadmin)
      end

      def destroy?
        has_permission?(:campaigns, :manage_users)
      end

      def import?
        has_permission?(:campaigns, :manage_users)
      end

      def allow_results_delete?
        has_permission?(:results, :reset_responses)
      end

      def manage_datasheets?
        has_permission?(:datasheets, :manage)
      end

      def approve_report?
        has_permission?(:campaigns, :manage)
      end

      def update?
        has_permission?(:campaigns, :manage)
      end

      def remove_report_approval?
        has_permission?(:campaigns, :manage)
      end

      def release_report?
        has_permission?(:campaigns, :manage)
      end

      def hold_report?
        has_permission?(:campaigns, :manage)
      end

      def remove_report_hold_release?
        has_permission?(:campaigns, :manage)
      end

      def mark_as_done?
        has_permission?(:campaigns, :manage)
      end

      def unmark_as_done?
        has_permission?(:campaigns, :manage)
      end

      def export_results?
        has_permission?(:results, :raw_responses)
      end

      def export_completion_status?
        has_permission?(:campaigns, :view)
      end

      def edit_dimension?
        has_permission?(:dimensions, :manage)
      end

      def reset_all_participants?
        has_permission?(:campaigns, :manage_users)
      end

      def reset_all_nominations?
        has_permission?(:campaigns, :reset_nominations)
      end

      def edit_user?
        has_permission?(:campaigns, :manage_users)
      end

      def reset_password?
        has_permission?(:users, :reset_password)
      end

      def view_report?
        has_permission?(:results, :view_report)
      end

      def download_report?
        has_permission?(:results, :download_report)
      end

      def regenerate_report?
        has_permission?(:results, :regenerate_report)
      end

      def view_responses?
        has_permission?(:results, :raw_responses)
      end

      def remove_subject?
        has_permission?(:projects, :manage_users)
      end

      def remove_from_campaign?
        has_permission?(:campaigns, :manage_users)
      end

      def create_all?
        has_permission?(:campaigns, :manage_users)
      end

      def search?
        has_permission?(:campaigns, :view)
      end

      def preview_report?
        has_permission?(:campaigns, :view)
      end

      def download_example_import_file?
        has_permission?(:campaigns, :view)
      end
    end
  end
end
