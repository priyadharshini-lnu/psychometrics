# frozen_string_literal: true

module Administration
  module Threesixty
    class EvaluatorPolicy < BasePolicy
      def manage_datasheets?
        user.is?(:superadmin) || user.has_grant?(:datasheets, :manage)
      end

      def manage_relationships?
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
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def reset_all_nominations?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def index?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end

      def import?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def spoof?
        user.is?(:superadmin)
      end

      def edit?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def remove_from_campaign?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def create_all?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :manage_users)
      end

      def download_example_import_file?
        user.is?(:superadmin) || user.has_grant?(:campaigns, :view)
      end
    end
  end
end
