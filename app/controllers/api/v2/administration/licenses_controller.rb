# frozen_string_literal: true

module Api
  class V2::Administration::LicensesController < Api::V2::Administration::BaseController
    validates_request_schema :create, lambda {
      Api::V2::License::Contract.new(schema: Api::V2::License::Schema.create_request)
    }
    validates_request_schema :update, lambda {
      Api::V2::License::Contract.new(schema: Api::V2::License::Schema.update_request)
    }

    validate_crud_requests Api::V2::License::Schema

    def context
      super.merge(
        client: client
      )
    end

    private

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::LicensePolicy,
            context[:user],
            @model,
            %w[index create update view_license_usages],
            { project_id: params[:client_id] }
          )
        },
        uat_users_count: lambda {
          ::User.where(project_id: client.projects.select(:id), is_uat: true).count
        }
      }
    end

    def client
      client_id = params[:client_id]

      @client ||= Api::Administration::ProjectPolicy::Scope.new(
        current_user, Client
      ).resolve.find(client_id)
    end

    def enforce_geo_restriction
      return if current_user.superadmin?

      super
    end
  end
end
