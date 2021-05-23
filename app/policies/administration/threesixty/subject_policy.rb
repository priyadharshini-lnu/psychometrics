# frozen_string_literal: true

module Administration
  module Threesixty
    class SubjectPolicy < BasePolicy
      def index?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end

      def spoof?
        user.is?(:superadmin)
      end

      def import?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def manage_datasheets?
        user.is?(:superadmin) || user.has_grant?(:datasheets, :manage)
      end

      def manage_relationships?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def approve_report?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def remove_report_approval?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def release_report?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def hold_report?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def remove_report_hold_release?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def mark_as_done?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def unmark_as_done?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage)
      end

      def export_results?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def export_completion_status?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end

      def edit_dimension?
        user.is?(:superadmin) || user.has_grant?(:dimensions, :manage)
      end

      def reset_all_participants?
        user.is?(:superadmin) || user.has_grant?(:dimensions, :manage)
      end

      def reset_all_nominations?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def edit_user?
        user.is?(:superadmin) || user.has_grant?(:projects, :manage_users)
      end

      def view_report?
        user.is?(:superadmin) || user.has_grant?(:results, :view_report)
      end

      def download_report?
        user.is?(:superadmin) || user.has_grant?(:results, :view_report)
      end

      def view_responses?
        user.is?(:superadmin) || user.has_grant?(:results, :raw_responses)
      end

      def remove_subject?
        user.is?(:superadmin) || user.has_grant?(:projects, :manage_users)
      end

      def remove_from_campaign?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def create_all?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def search?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end

      def preview_report?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end

      def download_example_import_file?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end
    end
  end
end
