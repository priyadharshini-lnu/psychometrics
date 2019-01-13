module Api
  module V1
    class ReportsController < BaseController
      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids + [project.id]
        membership_ids = user.memberships.where(client_id: project_campaign_ids).ids
        # We fetch all assigns from (sub)campaigns and filter project assigns
        assigns = Assign.includes(project_assign: :assessment, assigns_reports: { report: :assessments }).
          where(membership_id: membership_ids).
          where.not(project_assign_id: nil)
        render json: assigns.flat_map(&:assigns_reports).
          uniq { |r| r.report.id }.
          map { |r| Api::V1::AssignReportSerializer.new(r, assigns: assigns.index_by(&:assessment_id)).to_h }
      end

      def results
        assigns = Assign.completed.where(membership_id: project_membership, project_assign_id: nil, assessment_id: report.assessment_ids)
        render json: ::Reports::BuildResults.call(report, assigns)[:ok]
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
