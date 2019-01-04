module Api
  module V1
    class CampaignsController < Api::BaseController
      def duplicate
        render json: [:duplicate]
      end
      def index
        render json: [:list_camp]
      end
      def create
        render json: [:create_camp]
      end
    end
  end
end
