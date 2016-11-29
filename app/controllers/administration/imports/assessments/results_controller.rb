module Administration
  module Imports
    module Assessments
      class ResultsController < Administration::Imports::BaseController
        def new
          @resource = @resource_class.new
          @resource.client_id = params[:client_id]
          @resource.assessment_id = params[:assessment_id]
          respond_to do |format|
            format.js
          end
        end

        protected

        def import_params
          params.require(:import).permit(:file, :client_id, :assessment_id)
        end

        def init_import_class
          @resource_class ||= ::Imports::Assessments::ResultImport
        end

        def pundit_authorize
          authorize :assign, :import?
        end
      end
    end
  end
end
