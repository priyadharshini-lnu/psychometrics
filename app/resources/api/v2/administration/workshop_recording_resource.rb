# frozen_string_literal: true

class Api::V2::Administration::WorkshopRecordingResource < JSONAPI::Resource
  model_name 'MeetingRecording'

  attributes :status, :external_id, :recording_date, :recording_url, :assessors, :participants,
             :transcription_url, :transcription_text

  def recording_url
    @model.recording_file.attached? ? @model.recording_file.url : nil
  end

  def recording_date
    @model.created_at.to_date
  end

  def assessors
    @model.meeting_room.assessors
  end

  def participants
    @model.meeting_room.participants
  end

  def transcription_url
    @model.transcription_file.attached? ? @model.transcription_file.url : nil
  end

  def transcription_text
    return nil unless @model.transcription_file.attached?

    @model.transcription_file.download
  end
end
