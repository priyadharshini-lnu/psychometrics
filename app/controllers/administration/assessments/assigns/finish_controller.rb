module Administration
  module Assessments
    module Assigns
      class FinishController < Administration::BaseController
        before_action :set_assessment
        before_action :set_resource_class
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def show
          session.delete(token_session)
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

        # Authorisation user
        def pundit_authorize
          authorize [:assessments, @resource_class]
        end
      end
    end
  end
end
