# frozen_string_literal: true

module Administration
  class MeetingRecordingSerializer < Panko::Serializer
    attributes :id, :external_id, :recording_date, :recording_url, :assessors, :participants,
               :assessment_center_date_and_time, :transcription_url

    def recording_url
      object.recording_file.attached? ? object.recording_file.url : nil
    end

    def recording_date
      object.created_at.to_date
    end

    def assessors
      object.meeting_room.assessors
    end

    def participants
      object.meeting_room.participants
    end

    def assessment_center_date_and_time
      object.meeting_room.assessment_center_date_and_time
    end

    def transcription_url
      object.transcription_file.attached? ? object.transcription_file.url : nil
    end
  end
end
