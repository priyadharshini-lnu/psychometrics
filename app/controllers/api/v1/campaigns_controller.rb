module Api
  module V1
    class CampaignsController < ProjectScopeController
      def duplicate
        render json: Api::V1::CampaignSerializer.new(Client.last)
      end
      def index
        render json: Client.all.limit(5).map { |c| Api::V1::CampaignSerializer.new(c) }
      end
      def create
        render json: Api::V1::UserSerializer.new(User.last, project: project).to_h
      end
    end
  end
end
