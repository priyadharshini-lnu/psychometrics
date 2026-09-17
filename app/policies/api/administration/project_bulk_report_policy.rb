# frozen_string_literal: true

module Api
  module Administration
    class ProjectBulkReportPolicy < ::Administration::BasePolicy
      def index?
        @user.has_grant?(:reports, :project_bulk_reports)
      end

      def show?
        index?
      end

      def bulk_download?
        index?
      end

      def download_file?
        index?
      end
    end
  end
end
