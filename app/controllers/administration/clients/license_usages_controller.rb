# frozen_string_literal: true

module Administration
  module Clients
    class LicenseUsagesController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_client
      append_before_action :pundit_authorize
      append_before_action :init_breadcrumbs

      def index
        @_resources = license.license_usages.order(created_at: :desc).page(params[:page])
      end

      private

      def set_resource_class
        @_resource_class ||= LicenseUsage # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        add_breadcrumb t('administration.breadcrumbs.licenses'), [:administration, client.client, :licenses]
        add_breadcrumb license.decorate.display_name
      end

      def pundit_authorize
        authorize :license
      end

      def license
        @license ||= License.find_by(id: params[:license_id])
      end
    end
  end
end
