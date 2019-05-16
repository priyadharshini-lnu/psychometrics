module Threesixty
  class EvaluationsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_evaluation

    def show
      respond_to do |format|
        format.html { render 'threesixty/campaigns/show' }
        format.json do
          @users_assessment = UsersAssessment.find_by(campaign_id: @participant.campaign_id,
                                                      user_id: @participant.evaluator_id)
          @users_result = @users_assessment.
                          users_results.
                          create_with(status: :in_progress).
                          find_or_create_by(subject_id: @participant.subject_id)

          render json: @users_result, serializer: UsersResultSerializer,
                 participant: @participant, campaign: @campaign, include: '**'
        end
      end
    end

    def update_status
      @participant.update_attributes(evaluator_status: params[:status])
      render json: @participant, serializer: Threesixty::EndUser::EvaluationSerializer, include: '**'
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_evaluation
      @participant = @campaign.participants.find(params[:evaluation_id] || params[:id])
    end
  end
end
