module Administration
  module Assessments
    module Assigns
      class Step1Controller < Administration::BaseController
        before_action :set_assessment
        before_action :set_resource_class
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def show
          @assign = AssignForm.new({})
        end

        def update
          @assign = AssignForm.new(resource_params)
          # Assign Assessment to all SELECTED Clients
          @assessment.client_ids = @assign.client_ids.concat(@assessment.client_ids)
          @assessment.access_reports_at = @assign.access_reports == 'immediately' ? nil : @assign.access_reports_at
          @assessment.save

          # Assign Reports to all SELECTED Clients
          @assign.client_ids.each do |client_id|
            @assign.report_ids.each do |report_id|
              ClientReport.find_or_create_by({
                client_id: client_id,
                report_id: report_id
              })
            end
          end

          redirect_to(administration_assessment_step2_path) && return
        end

        private

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), [:administration, :assessments]
          add_breadcrumb t('.title', name: @assessment.decorate.display_name), request.path
        end

        # Set model
        def set_resource_class
          @resource_class ||= ::Assign
        end

        def set_assessment
          @assessment = policy_scope(::Assessment).includes(:reports).find(params[:assessment_id])
        end

        def resource_params
          params.fetch(:assign, {}).permit(:access_reports, :access_reports_at_date, :access_reports_at_time, client_ids: [], report_ids: [])
        end

        # Authorisation user
        def pundit_authorize
          authorize [:assessments, @resource_class]
        end
      end
    end
  end
end
