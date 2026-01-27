# frozen_string_literal: true

class Api::V2::Administration::MediaResponseResource < Api::V2::Administration::BaseResource
  attributes :id, :question_id, :transcription_text, :question_type, :transcription_status,
             :transcription_enabled

  def self.records(opts = {})
    user_assessment_id = opts[:context][:user_assessment_id]

    return MediaResponse.none if user_assessment_id.blank?

    user_assessment = UserAssessment.find_by(id: user_assessment_id)
    user_assessment&.users_result&.media_responses&.order(:created_at) || MediaResponse.none
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
    if @model.respond_to?(:transcription_status)
      @model.transcription_status
    elsif @model.transcription.present?
      'completed'
    else
      'not_requested'
    end
  end

  def transcription_enabled
    @model.question&.props&.[]('enableTranscription') || false
  end

  def asset_attached
    @model.asset.attached?
  end
end
