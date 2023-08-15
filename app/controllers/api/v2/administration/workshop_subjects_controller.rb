# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopSubjectsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopSubject::Schema

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::WorkshopSubjectPolicy,
            context[:user],
            @model,
            [
              'index',
              %w[manage update],
              'destroy'
            ],
            { project_id: context[:client_id] }
          )
        }
      }
    end
  end
end
