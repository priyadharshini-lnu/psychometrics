module Administration
  module Assessments
    module Assigns
      class Step1Controller < Administration::BaseController
        before_action :set_assessment
        before_action :set_resource_class
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def show
          @assign = AssignForm.new(session[token_session] || {})
        end

        def update
          @assign = AssignForm.new(resource_params)
          session[token_session] = @assign.as_json
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
          params.fetch(:assign, {}).permit(client_ids: [], report_ids: [], admin_ids: [], manager_ids: [], user_ids: [])
        end

        # Authorisation user
        def pundit_authorize
          authorize [:assessments, @resource_class]
        end
      end
    end
  end
end
