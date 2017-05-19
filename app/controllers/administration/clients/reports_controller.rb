module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      append_before_action :init_breadcrumbs

      def index
        @filter_form = client.reports.includes(:assessment).search(params[:q])
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
      end

      def create
        begin
          client.report_ids = client.root.available_reports.where(id: params[:report_ids]).ids
        rescue => e
          render :new and return
        end
        render :create
      end

      def destroy
        @resource = client.clients_reports.find_by(report_id: params[:id])
        @resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.report.decorate.display_name)) }
          format.js
        end
      end

      def i18n
        'clients.reports'
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) unless client.project_level?
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
      end
    end
  end
end
