# frozen_string_literal: true

module Api
  module V1
    class ReportsController < BaseController
      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        membership_ids = user.memberships.where(client_id: project_campaign_ids).ids
        # We should filter project assigns due to assign_reports relations are created only for (sub)campaigns
        # TODO (atanych): after fixing DB relations between assigns->assign_reports, fix this controller
        assigns = Assign.
                  includes(project_assign: :assessment, assigns_reports: { report: :assessments }).
                  where(membership_id: membership_ids)
        render json: assigns.flat_map(&:assigns_reports).
          uniq { |r| r.report.id }.
          map { |r| Api::V1::AssignReportSerializer.new(r, assigns: assigns.index_by(&:assessment_id)).to_h }
      end

      def results
        assigns = Assign.completed.where(membership: project_membership, project_assign_id: nil, assessment_id: report.assessment_ids)
        raise Errors::Api::AssessmentIsNotPassedError, "Assessments for report #{report.id} are not passed" if assigns.blank?

        render json: Api::V1::ResultSerializer.new(::Reports::BuildResults.call(report, assigns)[:ok]).to_h
      end

      def pdf
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        membership_ids = user.memberships.where(client_id: project_campaign_ids).ids
        # TODO: (atanych): we might fetch N different assigns_reports for different campaigns with one project and report id
        # TODO (atanych): How to handle it???
        assigns_report = report.assigns_reports.joins(:assign).find_by(assigns: { membership_id: membership_ids })
        # TODO: (atanych): we should think through report statuses
        render json: { url: assigns_report.pdf&.url, status: assigns_report.status }
      end

      def report
        @report ||=
          begin
            r = project.reports.find_by(id: params[:id])
            raise Errors::Api::ResourceNotFoundError, "Report with id=#{params[:id]} is not found" unless r

            # TODO: (atanych): report should be directly checked with user membership
            r
          end
      end
    end
  end
end
