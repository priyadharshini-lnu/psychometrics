# frozen_string_literal: true

module Administration
  module Projects
    class DatasheetRowsController < Administration::Projects::BaseController
      include Administration::DatasheetRowManagement
      before_action :set_init_state, only: [:index]

      private

      def datasheet
        @datasheet ||= project.datasheet
      end

      def parent_resource
        project
      end

      def set_init_state
        @init_state = {
          datasheet: {
            parentResource: { type: 'project', id: project.id }
          }
        }
      end
    end
  end
end
