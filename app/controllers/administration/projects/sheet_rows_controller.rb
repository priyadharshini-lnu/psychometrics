# frozen_string_literal: true

module Administration
  module Projects
    class SheetRowsController < Administration::Projects::BaseController
      include Administration::SheetRowManagement

      before_action :set_init_state, only: [:index]

      private

      def sheet
        @sheet ||= project.sheets.first
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
