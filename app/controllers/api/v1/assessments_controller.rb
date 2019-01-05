module Api
  module V1
    class AssessmentsController < ProjectScopeController
      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        membership_ids = user.memberships.where(client_id: project_campaign_ids).ids
        assigns = Assign.includes(:assessment).where(membership_id: membership_ids)
        render json: assigns.map { |a| Api::V1::AssignSerializer.new(a).to_h }
      end

      def user
        @user ||= ::Users::Regular.find_by(project_id: params[:project_id], id: params[:user_id])
      end
    end
  end
end
