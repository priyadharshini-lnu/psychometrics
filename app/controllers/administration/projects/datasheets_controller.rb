# frozen_string_literal: true

module Administration
  module Projects
    class DatasheetsController < Administration::Projects::BaseController
      include Administration::DatasheetManagement

      private

      def datasheet
        @datasheet ||= project.datasheet
      end

      def parent_resource
        project
      end
    end
  end
end
