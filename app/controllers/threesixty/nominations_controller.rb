module Threesixty
  class NominationsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_subject

    def show
      respond_to do |format|
        format.html {render 'threesixty/campaigns/show'}
        format.json {
          render json: @subject, serializer: Threesixty::NominationSerializer, include: '**'
        }
      end
    end

    def search_evaluators
      render json: Threesixty::Evaluators::SearchQuery.new(@campaign.campaign, @subject, params[:q]).query, each_serializer: ::Projects::SearchUserSerializer
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id] || params[:id])
    end
  end
end
