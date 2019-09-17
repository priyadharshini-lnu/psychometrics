# frozen_string_literal: true

module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      include Administration::Clients
      before_action :ensure_not_root
      append_before_action :init_breadcrumbs

      def index
        @_filter_form = client.clients_reports.includes(report: :assessments).search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def export
        @report = Report.find(params[:report_id])
        results = ::Exports::Reports::ReportDataExport.new(@report, client)
        respond_to do |format|
          format.xlsx { send_data results.to_xlsx.to_stream.read, filename: 'report_data.xlsx' }
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
        if client.subtenancy?
          add_breadcrumb(
            client.project.decorate.display_name,
            administration_client_project_campaigns_path(client.client, client.project)
          )
        end
        if client.sub_campaign?
          add_breadcrumb(
            client.parent.decorate.display_name,
            administration_client_project_campaign_sub_campaigns_path(client.client, client.project, client.parent)
          )
        end
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb t('administration.breadcrumbs.reports'), action: :index
      end
    end
  end
end
