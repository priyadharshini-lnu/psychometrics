module Administration
  module Imports
    class HrisController < Administration::Imports::BaseController
      def new
        @_resource = resource_class.new
        resource.client_id = params[:client_id]
        respond_to do |format|
          format.js
        end
      end

      protected

      def import_params
        params.require(:import).permit(:file, :client_id)
      end

      def init_import_class
        @_resource_class ||= ::Imports::HrisImport
      end

      def pundit_authorize
        authorize :user, :import?
      end
    end
  end
end
