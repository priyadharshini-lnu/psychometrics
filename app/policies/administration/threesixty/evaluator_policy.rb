# frozen_string_literal: true

module Administration
  module Threesixty
    class EvaluatorPolicy < BasePolicy
      def manage_datasheets?
        has_permission?(:datasheets, :manage)
      end

      def export_results?
        has_permission?(:results, :raw_responses)
      end

      def export_completion_status?
        has_permission?(:campaigns, :view)
      end

      def reset_all_participants?
        has_permission?(:campaigns, :manage_users)
      end

      def reset_all_nominations?
        has_permission?(:campaigns, :reset_nominations)
      end

      def index?
        has_permission?(:campaigns, :view)
      end

      def import?
        has_permission?(:campaigns, :manage_users)
      end

      def spoof?
        @user.is?(:superadmin) && !@record&.user&.superadmin?
      end

      def allow_results_delete?
        has_permission?(:results, :reset_responses)
      end

      def edit?
        has_permission?(:campaigns, :manage_users)
      end

      def remove_from_campaign?
        has_permission?(:campaigns, :manage_users)
      end

      def create_all?
        has_permission?(:campaigns, :manage_users)
      end

      def download_example_import_file?
        has_permission?(:campaigns, :view)
      end
    end
  end
end
