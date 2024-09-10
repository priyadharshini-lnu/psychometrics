# frozen_string_literal: true

module Threesixty
  class AssessmentsController < ApplicationController
    layout 'layouts/end_user'
    before_action :set_campaign

    def index
      result = participant.users_result
      assessment = @campaign.assessment
      authorize [:threesixty, assessment]

      piped_text_context = {
        evaluator: participant.evaluator,
        subject: participant.subject,
        threesixty_campaign: @campaign,
        result: result,
        assessment: assessment
      }

      @selected_locale = user_locale
      render json: AssessmentSerializer.new(
        context: {
          include: '**',
          selected_locale: @selected_locale,
          piped_text_context: piped_text_context
        }
      ).serialize(assessment)
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
