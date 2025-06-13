# frozen_string_literal: true

module Api
  module V2
    module Administration
      class ClientFeaturesController < Api::V2::Administration::BaseController
        validate_crud_requests Api::V2::ClientFeature::Schema

        def context
          super.merge(
            client_id: params[:id]
          )
        end
      end
    end
  end
end
