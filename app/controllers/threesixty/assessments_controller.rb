# frozen_string_literal: true

module Threesixty
  class AssessmentsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign

    def index
      piped_text_context = {
        evaluator: participant.evaluator,
        subject: participant.subject,
        threesixty_campaign: @campaign
      }
      assessment = @campaign.assessment
      authorize [:threesixty, assessment]
      render json: assessment, serializer: ::AssessmentSerializer, include: '**', piped_text_context: piped_text_context
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def participant
      @participant ||= Threesixty::Participant.find(params[:evaluation_id])
    end
  end
end
