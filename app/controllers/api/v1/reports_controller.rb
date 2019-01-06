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
        render json: { any: :any }
      end
      def pdf
        render json: { url: 's3.amazon.com/uri', status: 'ready' }
      end
    end
  end
end
