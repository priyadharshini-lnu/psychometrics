module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      include Administration::Clients
      before_action :ensure_not_root
      append_before_action :init_breadcrumbs

      def index
        @_filter_form = client.reports.includes(:assessment).search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
      end

      def create
        render :new unless client.update(client_params)
      end

      def destroy
        @_resource = client.clients_reports.find_by(report_id: params[:id])
        resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: resource.report.decorate.display_name)) }
          format.js
        end
      end

      def i18n
        'clients.reports'
      end

      private

      def client_params
        params.require(:client).permit(report_ids: [])
      end

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) if client.subtenancy?
        add_breadcrumb client.parent.decorate.display_name, administration_client_project_campaign_sub_campaigns_path(client.client, client.project, client.parent) if client.sub_campaign?
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb t('administration.breadcrumbs.reports'), { action: :index }
      end
    end
  end
end
