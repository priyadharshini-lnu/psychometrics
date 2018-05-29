module Services
  module Hogan
    class AssignAssessmentAndReports
      include Interactor

      def call
        group = context.assessment_params[:group]
        result = Services::Hogan::API::GroupDetails.call(group: group)
        return if result.success?

        result = Services::Hogan::API::CreateGroup.call(group: group)
        if result.failure?
          context.fail!(error: result.error)
        end
      end
    end
  end
end
