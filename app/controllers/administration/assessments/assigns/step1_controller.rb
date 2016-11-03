module Administration
  module Assessments
    module Assigns
      class Step1Controller < Administration::BaseController
        before_action :set_assessment
        before_action :set_resource_class
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def show
          @assign = AssignForm.new(@assessment.assign_form_attributes || {})
        end

        def update
          @assign = AssignForm.new(resource_params)
          # Destroy all NOT SELECTED assigned Clients to Assessment
          AssessmentClient.where({
            client_id: @assessment.client_ids - @assign.client_ids,
            assessment_id: @assessment.id
          }).destroy_all
          # Assign Assessment to all SELECTED Clients
          @assessment.update_attributes({
            client_ids: @assign.client_ids,
            access_reports_at: @assign.access_reports == 'immediately' ? nil : @assign.access_reports_at
          })

          # Destroy all assigned Reports
          ClientReport.where({
            report_id: @assessment.report_ids
          }).delete_all
          # Assign Reports to all SELECTED Clients
          @assign.client_ids.each do |client_id|
            @assign.report_ids.each do |report_id|
              ClientReport.create({
                client_id: client_id,
                report_id: report_id
              })
            end
          end

          redirect_to(administration_assessment_step2_path) && return
        end

        private

        def token_session
          @token_session ||= "assign_form_#{@assessment.id}_#{current_user.id}"
        end

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
