# frozen_string_literal: true

class MediaResponseSerializer < Panko::Serializer
  attributes :id, :user_selected, :filename, :question_id, :url, :created_at, :encoded_file_url, :file_extension,
             :transcription_text, :transcription_segments, :question_type, :transcription_status,
             :transcription_enabled, :disable_transcript_download, :hide_participant_video

  def campaign_options
    context && context[:campaign]&.campaign_options
  end

  def url
    return nil if hide_participant_video

    object.asset.url(expires_in: 1.week)
  end

  def encoded_file_url
    url ? URI.encode_www_form_component(url) : nil
  end

  def file_extension
    url ? Pathname(url.split('?')[0]).extname.downcase : nil
  end

  def transcription_text
    object.transcription&.text
  end

  def transcription_segments
    object.transcription&.segments || []
  end

  def disable_transcript_download
    campaign_options&.disable_transcript_download == true
  end

  def hide_participant_video
    campaign_options&.hide_participant_video == true && question_type == 'video'
  end

  def question_type
    case object.question.type
      when 'AudioResponse'
        'audio'
      when 'VideoResponse'
        'video'
    end
  end

  def transcription_enabled
    object.question.props&.[]('enableTranscription')
  end
end
