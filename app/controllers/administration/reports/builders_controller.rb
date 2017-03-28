module Administration
  module Reports
    class BuildersController < Administration::BaseController
      before_action :set_assessment
      append_before_action :pundit_authorize

      def update
        builder = ::Builders::ReportBuilder.new(@report, params.require(:builder), current_user)
        if builder.save
          render json: { data: ReportSerializer.new(@report).to_hash(include: '**') }
        else
          render json: { error: true }, status: 400
        end
      end

      private

      def set_assessment
        @report = policy_scope(::Report).find(params[:report_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize [:assessments, :builder]
      end
    end
  end
end
