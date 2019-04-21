module Threesixty
  class CampaignsController < ApplicationController
    layout 'layouts/threesixty_campaign'

    def show
      respond_to do |format|
        format.html {}
        format.json { render json: Threesixty::CampaignSerializer.new(Campaign.first)}
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
