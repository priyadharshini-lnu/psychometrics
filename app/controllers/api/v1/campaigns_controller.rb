module Api
  module V1
    class CampaignsController < ProjectScopeController
      def duplicate
        render json: Api::V1::CampaignSerializer.new(Client.last)
      end
      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        campaigns = user.memberships.includes(:client).where(client_id: project_campaign_ids).map(&:client)
        render json: campaigns.map { |c| Api::V1::CampaignSerializer.new(c) }
      end
      def create
        render json: Api::V1::UserSerializer.new(User.last, project: project).to_h
      end

      def user
        @user ||= ::Users::Regular.find_by(project_id: params[:project_id], id: params[:user_id])
      end
    end
  end
end
