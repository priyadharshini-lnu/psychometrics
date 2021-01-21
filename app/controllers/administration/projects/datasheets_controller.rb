# frozen_string_literal: true

module Administration
  module Projects
    class DatasheetsController < Administration::Projects::BaseController
      prepend_before_action :set_resource_class
      before_action :set_init_state, only: [:index]

      def index
        respond_to do |format|
          format.html
          format.json do
            render json: {
              datasheet: [{ email: 'john@cc.com', first_name: 'John' }, { email: 'jane@cc.com', first_name: 'Jane' }],
              total: 2
            }
          end
        end
      end

      private

      def set_resource_class
        @_resource_class ||= Datasheet # rubocop:disable Naming/MemoizedInstanceVariableName
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
