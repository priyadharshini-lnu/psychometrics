# frozen_string_literal: true

module Administration
  module Reports
    class BuildersController < Administration::BaseController
      before_action :set_report
      append_before_action :pundit_authorize

      def update
        builder = ::Builders::ReportBuilder.new(@report, params.require(:builder), current_user)
        if builder.save
          @report = Report.includes(pages: [:modules]).find(@report.id)
          render json: { data: ReportSerializer.new(@report).to_hash(include: '**') }
        else
          render json: { error: true }, status: 400
        end
      end

      private

      def set_report
        @report = policy_scope(::Report).find(params[:report_id])
      end

      # Authorisation user
      def pundit_authorize
        authorize %i[reports builder]
      end
    end
  end
end
