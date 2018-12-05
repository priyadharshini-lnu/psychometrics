module Administration
  module Clients
    class AssignReportsController < Administration::BaseController
      include Administration::Clients
      before_action :ensure_not_root
      append_before_action :init_breadcrumbs
      append_before_action :pundit_authorize

      def new
        @report_families = client.root.
                                  report_families.
                                  includes(:reports).
                                  where(reports: { disabled: false }).
                                  references(:reports).
                                  distinct
        @_resource = AssignReportsForm.new
      end

      def create
        @report_families = client.root.
                                  report_families.
                                  includes(:reports).
                                  where(reports: { disabled: false }).
                                  references(:reports).
                                  distinct
        @_resource = AssignReportsForm.
                     from_params(params[:resource]).
                     with_context(client: client, client_tenancy: client.root)

        respond_to do |format|
          format.js do
            AssignReports.call(resource, client) do
              on(:invalid) { render :new }
            end
          end
        end
      end

      def edit
        @report_family = ReportFamily.find(params[:report_family_id])
        @reports_assigned = @report_family.reports.where(id: client.report_ids)
        @reports = @report_family.reports.where.not(id: client.report_ids)
        @_resource = AssignReportsForm.new({
          report_family_id: @report_family.id,
          report_ids: client.report_ids,
          user_access_report_ids: client.clients_reports.where(user_access: true).pluck(:report_id),
          new_record: false,
        })
      end

      def update
        @report_family = ReportFamily.find(params.dig(:resource, :report_family_id))
        @reports_assigned = @report_family.reports.where(id: client.report_ids).distinct
        @reports = @report_family.reports.where.not(id: client.report_ids).distinct
        @_resource = AssignReportsForm.
                     from_params(params[:resource], { new_record: false }).
                     with_context(client: client, client_tenancy: client.root)

        respond_to do |format|
          format.js do
            AssignReports.call(resource, client) do
              on(:invalid) { render :edit }
            end
          end
        end
      end

      def i18n
        'clients.assign_reports'
      end

      private

      def pundit_authorize
        authorize :client_report
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
