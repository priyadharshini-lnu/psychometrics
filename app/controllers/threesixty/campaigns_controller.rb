module Threesixty
  class CampaignsController < ApplicationController
    layout 'layouts/threesixty_campaign'

    def show
      respond_to do |format|
        format.html {}
        format.json do
          campaign = Threesixty::Campaign.find(params[:id])
          nominations = Threesixty::NominationsByUser.new(current_user).query
          render json: campaign, serializer: Threesixty::CampaignSerializer, nominations: nominations, include: '**'
        end
      end

    end

    def nominations
      render :show
    end

    def evaluators
      render :show
    end

    def reports
      render :show
    end

  end
end
