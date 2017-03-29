module Administration
  module Clients
    class AssessmentsController < Administration::BaseController
      prepend_before_action :set_resource_class
      before_action :pundit_authorize
      before_action :init_breadcrumbs
      skip_after_action :verify_policy_scoped, only: [:index]

      def index
        @filter_form = client.assessments.includes(:dimension).search(params[:q])
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def export_results
        @assessment = Assessment.find(params[:assessment_id])
        results = ::Exports::Assessments::AssessmentResultsExport.new(@assessment.id, client.id, scoring: params[:scoring])
        filename = params[:scoring] ? 'assessment_scoring_results.xlsx' : 'assessment_raw_results.xlsx'
        respond_to do |format|
          format.xlsx { send_data results.render.to_stream.read, filename: filename }
        end
      end

      def destroy
        @resource = client.assessments.find(params[:id])
        client.clients_reports.where(report_id: @resource.report_ids).destroy_all
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
          format.js
        end
      end

      def i18n
        'clients.assessments'
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) unless client.project_level?
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), { action: :index }
      end

      # Set model
      def set_resource_class
        @resource_class ||= Assessment
      end

      # Authorisation user
      def pundit_authorize
        authorize :assessment_client
      end
    end
  end
end
