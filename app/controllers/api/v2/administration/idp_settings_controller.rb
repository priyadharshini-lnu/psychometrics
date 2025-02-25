# frozen_string_literal: true

module Api
  class V2::Administration::IdpSettingsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::IdpSetting::Schema
    validates_request_schema :update, V2::IdpSetting::UpdateContract.new

    def project_id
      @model&.project_id || params.dig(:filter, :project_id_eq)
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::IdpSettingPolicy,
            context[:user],
            @model,
            [
              'manage_global_skills'
            ],
            {
              project_id: params.dig(:filter, :project_id_eq)
            }
          )
        }
      }
    end
  end
end
