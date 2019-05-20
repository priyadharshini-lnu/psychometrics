module Threesixty
  class EvaluatorsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_subject
    before_action :set_nomination, only: [:update_status]

    def create
      form = ::Threesixty::Participants::CreateForm.from_params(params).with_context(subject: @subject)

      if form.valid?
        participant = @subject.participants.build(evaluator_params)
        participant.campaign_id = @campaign.campaign_id
        participant.project_id = @campaign.project.id
        participant.save!
        participant.threesixty_subject.increment!(:evaluators_count)
        participant.threesixty_evaluator.increment!(:evaluations_count)
        render json: participant, serializer: Threesixty::EndUser::NomineeSerializer, include: '**'
      else
        render json: { errors: form.error_mesages }, status: :bad_request
      end
    end

    def update_status
      @nomination.update_attributes(manager_status: params[:status])
      render json: @nomination, serializer: Threesixty::EndUser::NomineeSerializer, include: '**'
    end

    def destroy
      @nomination = @subject.participants.find_by(evaluator_id: params[:id])
      @nomination.destroy
      @nomination.threesixty_subject.decrement!(:evaluators_count)
      @nomination.threesixty_evaluator.decrement!(:evaluations_count)
      render json: nil
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id])
    end

    def set_nomination
      @nomination = @subject.participants.find_by(id: params[:evaluator_id] || params[:id])
    end

    def evaluator_params
      params.permit(:evaluator_id, :relationship_id)
    end
  end
end
