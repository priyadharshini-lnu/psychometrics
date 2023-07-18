# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Workshop::Schema

    private

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::WorkshopPolicy,
            context[:user],
            @model,
            %w[index show],
            { project_id: context[:client_id] }
          )
        }
      }
    end
  end
end
