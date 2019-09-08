# frozen_string_literal: true

module Administration
  module Imports
    module Assessments
      class ResultsController < Administration::Imports::BaseController
        def new
          @_resource = resource_class.new
          resource.client_id = policy_scope(Client).find(params[:client_id])&.id
          resource.assessment_id = policy_scope(Assessment).find(params[:assessment_id])&.id
          resource.scoring = params[:scoring]
          respond_to do |format|
            format.js
          end
        end

        protected

        def import_params
          params.require(:import).permit(:file, :client_id, :assessment_id, :scoring)
        end

        def init_import_class
          @_resource_class ||= ::Imports::Assessments::ResultImport
        end

        def pundit_authorize
          authorize :assign, :import?
        end
      end
    end
  end
end
