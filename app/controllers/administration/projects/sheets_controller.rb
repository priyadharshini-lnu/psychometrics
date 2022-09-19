# frozen_string_literal: true

module Administration
  module Projects
    class SheetsController < Administration::Projects::BaseController
      include Administration::SheetManagement

      private

      def sheet
        @sheet ||= project.sheets.first
      end

      def parent_resource
        project
      end
    end
  end
end
