module Threesixty
  class EvaluatorsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_subject

    def create
      if @subject.participants.find_by(evaluator_id: params[:evaluator_id])
        render json: {error:  'already exists'}, status: 422
      else
        participant = @subject.participants.build(evaluator_params)
        participant.campaign_id = @campaign.campaign_id
        participant.project_id = @campaign.project.id
        participant.save!
        render json: participant.threesixty_evaluator, serializer: Threesixty::EndUser::NominantSerializer, include: '**'
      end
    end

    def destroy
      nomination = @subject.participants.find_by(evaluator_id: params[:id])
      nomination.destroy
      render json: nil
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id])
    end

    def evaluator_params
      params.require(:evaluation).permit(:evaluator_id, :relationship_id)
    end
  end
end
