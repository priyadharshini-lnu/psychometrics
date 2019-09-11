# frozen_string_literal: true

module Administration
  module Clients
    class LicensesController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_client, except: :overview
      before_action :set_resource, only: %i[edit update toggle_status]
      append_before_action :pundit_authorize
      append_before_action :init_breadcrumbs

      def index
        @_filter_form = client.licenses.includes(:report_family).search(params[:q])
        @_resources = filter_form.result.order(created_at: :desc).page(params[:page])
        @report_families = ReportFamily.joins(:licenses).where(licenses: { client_id: client.root.id }).distinct

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def create
        @_resource = client.root.licenses.build(resource_params)
        render :new unless resource.save
      end

      def update
        render :edit unless resource.update(resource_params)
      end

      def overview
        @_resource = policy_scope(Client).
                     includes(licenses: %i[report_family license_usages]).
                     find(client.root.id)
      end

      def toggle_status
        resource.toggle!(:disabled)
        respond_to do |format|
          format.js
        end
      end

      def i18n
        'clients.licenses'
      end

      private

      def set_resource_class
        @_resource_class ||= License # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).includes(:report_family, :license_usages).find(params[:id])
      end

      def resource_params
        params.require(:resource).permit(:number, :overuse_number, :report_family_id,
                                         :start_date, :end_date, :disabled, :type)
      end

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        add_breadcrumb t('administration.breadcrumbs.licenses'), action: :index
      end

      def pundit_authorize
        authorize :license
      end
    end
  end
end
