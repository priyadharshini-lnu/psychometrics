# frozen_string_literal: true

module Api
  class V2::Administration::LicenseUsagesController < Api::V2::Administration::BaseController
    def toggle_status
      usage = LicenseUsage.find(params[:id])
      license_counter_update = usage.active? ? 'decrement!' : 'increment!'
      new_status = usage.active? ? 'inactive' : 'active'
      audit! :toggle_status, usage, user: current_user,
        payload: { license_usage_id: usage.id, license_id: usage.license_id, status: new_status }
      usage.update!(
        status: new_status,
        status_updated_at: Time.zone.now,
        status_updated_by_id: current_user.id
      )
      usage.license.method(license_counter_update).call(:used_number)

      jsonapi_render json: usage
    end

    private

    def meta_details
      {
        report_family_name: lambda {
          Api::Administration::LicensePolicy::Scope.new(current_user, License).
            resolve.find(params[:license_id]).report_family&.name
        },
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::LicensePolicy,
            context[:user],
            @model,
            %w[index toggle_status],
            { project_id: context[:client_id] }
          )
        }
      }
    end
  end
end
