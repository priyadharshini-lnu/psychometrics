module Threesixty
  class EvaluationsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_evaluation, except: [:deny]

    def show
      respond_to do |format|
        format.html { render 'threesixty/campaigns/show' }
        format.json do
          @users_result = UsersResult.find_or_create_by(campaign_id: @campaign.campaign_id,
                                                        subject_id: @participant.subject_id,
                                                        evaluator_id: @participant.evaluator_id) do |result|
            result.assessment_id = @campaign.assessment_id
            result.status = :in_progress
          end
          if params[:edit] == 't'
            @users_result.step = 0
            @users_result.status = :in_progress
          end

          render json: @users_result, serializer: UsersResultSerializer,
                 participant: @participant, campaign: @campaign,
                 current_user: current_user, include: '**'
        end
      end
    end

    def deny
      @participant = @campaign.participants.find_by!(evaluator_id: current_user.id, id: params[:evaluation_id] || params[:id])
      @participant.update_attributes(evaluator_nomination_status: :denied)
      render json: @participant, serializer: Threesixty::EndUser::EvaluationSerializer, include: '**'
    end

    def update_status
      @participant.update_attributes(manager_nomination_status: params[:status])
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
