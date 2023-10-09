# frozen_string_literal: true

module Administration
  module Clients
    class LicenseUsagesController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[toggle_activation_status]
      before_action :ensure_client
      append_before_action :pundit_authorize
      before_action :init_state, only: [:index]

      def toggle_activation_status
        license_counter_update = resource.active? ? 'decrement!' : 'increment!'
        new_status = resource.active? ? 'inactive' : 'active'
        resource.update!(status: new_status,
                         status_updated_at: Time.zone.now, status_updated_by_id: current_user.id)
        resource.license.method(license_counter_update).call(:used_number)
      end

      def i18n
        'clients.license_usages'
      end

      private

      def set_resource_class
        @_resource_class ||= LicenseUsage # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def pundit_authorize
        authorize :license_usage
      end

      def license
        @license ||= License.find_by(id: params[:license_id])
      end
    end
  end
end
