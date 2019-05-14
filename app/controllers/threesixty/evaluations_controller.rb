module Threesixty
  class EvaluationsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_evaluation

    def show
      respond_to do |format|
        format.html {render 'threesixty/campaigns/show'}
        format.json do
          # TODO: upgrade to use new user assigns
          render json: {}, include: '**'
        end
      end
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_evaluation
      @participant = @campaign.participants.find(params[:id])
    end
  end
end
