module Administration
  module Clients
    class AssessmentsController < Administration::BaseController
      prepend_before_action :set_resource_class
      before_action :pundit_authorize
      before_action :init_breadcrumbs
      skip_after_action :verify_policy_scoped, only: [:index]

      def index
        @filter_form = policy_scope(@resource_class).includes(:dimension).search(params[:q])
        @resources = @filter_form.result.with_client(client.id).page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def export_results
        @assessment = Assessment.with_client(client.id).find(params[:assessment_id])
        results = ::Exports::Assessments::AssessmentResultsExport.new(@assessment.id, client.id)
        respond_to do |format|
          format.xlsx { send_data results.render.to_stream.read, filename: 'assessment_raw_results.xlsx' }
        end
      end

      def destroy
        @resource = AssessmentClient.find_by(client_id: client.id, assessment_id: params[:id])
        @resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.assessment.decorate.display_name)) }
          format.js
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.parent.decorate.display_name, [:administration, client.parent] if client.parent.present?
        add_breadcrumb client.decorate.display_name, '#'
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
