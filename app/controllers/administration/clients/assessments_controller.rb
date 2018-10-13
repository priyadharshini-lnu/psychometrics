module Administration
  module Clients
    class AssessmentsController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_not_root
      before_action :pundit_authorize
      before_action :init_breadcrumbs
      skip_after_action :verify_policy_scoped, only: [:index]

      def index
        @_filter_form = client.assessments.includes(:dimension).search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def export_results
        @assessment = Assessment.find(params[:assessment_id])
        results = ::Exports::Assessments::AssessmentResultsExport.new(@assessment, client.id, export_results_params)
        filename = params[:scoring] ? 'assessment_scoring_results.xlsx' : 'assessment_raw_results.xlsx'
        respond_to do |format|
          format.xlsx { send_data results.to_xlsx.to_stream.read, filename: filename }
        end
      end

      def export_hogan_results
        @assessment = Assessment.find(params[:assessment_id])
        results = ::Exports::Assessments::HoganResultsExport.new(client.id, @assessment.id, params[:report_id])
        respond_to do |format|
          format.xlsx { send_data results.to_xlsx.to_stream.read, filename: 'hogan_assessment_results.xlsx' }
        end
      end

      def destroy
        @_resource = client.assessments.find(params[:id])
        client.clients_reports.where(report_id: resource.report_ids).destroy_all
        respond_to do |format|
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end

      def i18n
        'clients.assessments'
      end

      private

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) if client.subtenancy?
        add_breadcrumb client.parent.decorate.display_name, administration_client_project_campaign_sub_campaigns_path(client.client, client.project, client.parent) if client.sub_campaign?
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), { action: :index }
      end

      # Set model
      def set_resource_class
        @_resource_class ||= Assessment
      end

      # Authorisation user
      def pundit_authorize
        authorize :assessment_client
      end

      def export_results_params
        params.permit(:external, :scoring)
      end
    end
  end
end
