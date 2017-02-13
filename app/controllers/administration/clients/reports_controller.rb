module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      before_action :set_client
      append_before_action :init_breadcrumbs

      # GET /administration/resources
      def index
        @filter_form = policy_scope(@resource_class).includes(:assessment).search(params[:q])
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def destroy
        @resource = ClientReport.find_by(client_id: @client.id, report_id: params[:id])
        @resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.report.decorate.display_name)) }
          format.js
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb @client.decorate.display_name, '#'
        add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
      end

      def set_client
        @client = policy_scope(Client).enabled.find(params[:client_id])
      end
    end
  end
end
