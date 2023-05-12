# frozen_string_literal: true

module Api
  class V2::Administration::LicenseUsagesController < Api::V2::Administration::BaseController
    def toggle_status
      usage = LicenseUsage.find(params[:id])
      license_counter_update = usage.active? ? 'decrement!' : 'increment!'
      new_status = usage.active? ? 'inactive' : 'active'
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
