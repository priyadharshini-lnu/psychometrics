# frozen_string_literal: true

module Api
  class V2::Administration::MediaResponsesController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    before_action :load_media_response, only: [:generate_transcription]
    before_action :validate_transcription_eligibility, only: [:generate_transcription]

    def generate_transcription
      MediaResponses::AddTranscriptionJob.perform_later(@media_response.id)
      render json: { success: true }, status: :ok
    end

    private

    def load_media_response
      @media_response = MediaResponse.find(params[:id])
    end

    def pundit_authorize
      authorize(
        @media_response || MediaResponse,
        nil,
        policy_class: Api::Administration::MediaResponsePolicy
      )
    end

    def validate_transcription_eligibility
      unless can_generate_transcription?
        render json: {
          success: false,
          message: I18n.t('shared.transcription_already_requested')
        }, status: :unprocessable_entity
      end
    end

    def can_generate_transcription?
      @media_response.question.type.in?(%w[VideoResponse AudioResponse]) &&
        @media_response.question.props&.[]('enableTranscription')
    end

    def context
      super.merge(
        user_assessment_id: params[:user_assessment_id]
      )
    end
  end
end
