module Api
  module V1
    class AssessmentsController < BaseController
      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        membership_ids = user.memberships.where(client_id: project_campaign_ids).ids
        assigns = Assign.includes(:assessment).where(membership_id: membership_ids)
        render json: assigns.uniq { |a| a.assessment_id }.map { |a| Api::V1::AssignSerializer.new(a).to_h }
      end
    end
  end
end
