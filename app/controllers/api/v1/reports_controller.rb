module Api
  module V1
    class ReportsController < ProjectScopeController
      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        membership_ids = user.memberships.where(client_id: project_campaign_ids).ids
        assigns = Assign.includes(:assessment, assigns_reports: :report).where(membership_id: membership_ids)

        render json: assigns.flat_map(&:assigns_reports).map { |r| Api::V1::AssignReportSerializer.new(r).to_h }
      end

      def results
        report
        # TODO (atanych): awating https://gitlab.com/tte-lighthouse/psychometrics/issues/37
        render json: { any: :any }
      end

      def pdf
        report
        # TODO (atanych): awating https://gitlab.com/tte-lighthouse/psychometrics/issues/27
        render json: { url: 's3.amazon.com/uri', status: 'ready' }
      end

      def report
        @report ||=
          begin
            r = project.reports.find_by(id: params[:id])
            raise Errors::ApiError, "Report with id=#{params[:id]} is not found" unless r
            # TODO (atanych): report should be directly checked with user membership
            r
          end
      end
    end
  end
end
