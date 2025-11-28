# frozen_string_literal: true

class Api::V2::Administration::Subjects::MeetingRecordingResource < JSONAPI::Resource
  model_name 'MeetingRecording'

  attributes :id, :status, :external_id, :recording_date, :recording_url, :assessment_center_date_and_time, :assessors,
             :participants, :transcription_url

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

  def assessment_center_date_and_time
    @model.meeting_room.assessment_center_date_and_time
  end

  def transcription_url
    @model.transcription_file.attached? ? @model.transcription_file.url : nil
  end
end
