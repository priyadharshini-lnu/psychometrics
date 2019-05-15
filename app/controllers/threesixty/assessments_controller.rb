module Threesixty
  class AssessmentsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign

    def index
      assessment = @campaign.assessment
      render json: assessment, serializer: AssessmentSerializer, include: '**'
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end
  end
end
