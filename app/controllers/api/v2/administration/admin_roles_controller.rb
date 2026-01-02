# frozen_string_literal: true

module Api
  class V2::Administration::AdminRolesController < Api::V2::Administration::BaseController
    def enforce_geo_restriction
      return if current_user.superadmin?

      super
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::AdminRolePolicy,
            context[:user],
            @model,
            [
              'index',
              'create',
              %w[edit update],
              %w[remove destroy]
            ],
            { project_id: context[:client_id] }
          )
        }
      }
    end
  end
end
