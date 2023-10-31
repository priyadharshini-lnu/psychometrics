# frozen_string_literal: true

module Administration
  module ReportFamilies
    class ReportsController < Administration::BaseController
      append_before_action :pundit_authorize
      render_entrypoint :index, element: 'reports', entry: 'admin/reports'

      private

      def resource_class
        @_resource_class ||= Report # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
