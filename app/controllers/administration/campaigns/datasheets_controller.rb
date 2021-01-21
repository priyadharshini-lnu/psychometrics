# frozen_string_literal: true

module Administration
  module Campaigns
    class DatasheetsController < Administration::Projects::BaseController
      prepend_before_action :set_resource_class

      def index
        respond_to do |format|
          format.json do
            render json: {
              datasheet: [{ email: 'sam@cc.com', first_name: 'Sam' }, { email: 'sean@cc.com', first_name: 'Sean' }],
              total: 2
            }
          end
        end
      end

      private

      def set_resource_class
        @_resource_class ||= Datasheet # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
