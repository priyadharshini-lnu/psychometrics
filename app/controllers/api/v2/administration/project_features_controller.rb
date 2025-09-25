# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ProjectFeaturesController < Api::V2::Administration::BaseController
        validates_request_schema :update, -> { Api::V2::ProjectFeature::Contract.new }
        validate_crud_requests Api::V2::ProjectFeature::Schema

        def context
          super.merge(
            project_id: params[:project_id]
          )
        end
      end
    end
  end
end
