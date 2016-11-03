module Administration
  module Imports
    class UsersController < Administration::Imports::BaseController
      def new
        @resource = @resource_class.new
        @resource.client_id = params[:client_id]
        respond_to do |format|
          format.js
        end
      end

      protected

      def import_params
        params.require(:import).permit(:file, :client_id)
      end

      def init_import_class
        @resource_class ||= ::Imports::UserImport
      end

      def pundit_authorize
        authorize :user, :import?
      end
    end
  end
end
