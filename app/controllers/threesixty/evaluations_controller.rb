module Threesixty
  class EvaluationsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_evaluation

    def show
      respond_to do |format|
        format.html {render 'threesixty/campaigns/show'}
        format.json do
          @assign = Assign.find_by(campaign_id: @participant.campaign_id,
                                   subject_id: @participant.subject_id,
                                   evaluator_id: @participant.evaluator_id)
          render json: @assign, serializer: AssignSerializer, include: '**'
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
