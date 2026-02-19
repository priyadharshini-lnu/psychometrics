# frozen_string_literal: true

class Api::V2::Administration::MediaResponseResource < Api::V2::Administration::BaseResource
  attributes :id, :question_id, :transcription_text, :question_type, :transcription_status,
             :transcription_enabled, :asset_url

  def self.records(opts = {})
    user_assessment_id = opts[:context][:user_assessment_id]
    user_assessment = UserAssessment.find_by(id: user_assessment_id)
    users_result = user_assessment&.users_result

    return MediaResponse.none if users_result.blank?

    users_result.media_responses.
      joins(:asset_attachment).
      order(:created_at)
  end

  def transcription_text
    @model.transcription&.text
  end

  def question_type
    case @model.question&.type
      when 'AudioResponse'
        'audio'
      when 'VideoResponse'
        'video'
    end
  end

  def transcription_status
    @model.transcription&.status || 'not_requested'
  end

  def transcription_enabled
    @model.question&.props&.[]('enableTranscription') || false
  end
end
