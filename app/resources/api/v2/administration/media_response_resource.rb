# frozen_string_literal: true

class Api::V2::Administration::MediaResponseResource < Api::V2::Administration::BaseResource
  attributes :question_id, :transcription_text, :question_type, :transcription_status,
             :transcription_enabled, :asset_url, :media_id, :question_text, :question_name, :error_details

  def self.records(opts = {})
    user_assessment_id = opts[:context][:user_assessment_id]
    user_assessment = UserAssessment.find_by(id: user_assessment_id)
    users_result = user_assessment&.users_result

    return MediaResponse.none if users_result.blank?

    users_result.media_responses.
      joins(:asset_attachment, :question).
      order('questions.position ASC')
  end

  def transcription_text
    @model.transcription&.text
  end

  def question_type
    case @model.question&.type # rubocop:disable Style/HashLikeCase
      when 'AudioResponse'
        'audio'
      when 'VideoResponse'
        'video'
      when 'FileUpload'
        'file'
    end
  end

  def transcription_status
    @model.transcription&.status || 'not_requested'
  end

  def error_details
    @model.transcription&.error_details
  end

  def transcription_enabled
    @model.question&.props&.[]('enableTranscription') || false
  end

  def media_id
    @model.id
  end

  def question_text
    question = @model.question
    return nil unless question

    props = question.props
    raw_text = props&.[]('questionText')
    return nil if raw_text.blank?

    ActionController::Base.helpers.strip_tags(raw_text)
  end

  def question_name
    @model.question&.name
  end
end
