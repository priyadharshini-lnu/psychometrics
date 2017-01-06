module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      append_before_action :init_breadcrumbs

      def index
        @filter_form = client.reports.includes(:clients, :assessment).search(params[:q])
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def destroy
        @resource = ClientReport.find_by(client_id: client.id, report_id: params[:id])
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
        add_breadcrumb client.parent.decorate.display_name, [:administration, client.parent] if client.parent.present?
        add_breadcrumb client.decorate.display_name, '#'
        add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
      end
    end
  end
end
