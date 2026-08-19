# frozen_string_literal: true

module Administration
  class MeetingRecordingSerializer < Panko::Serializer
    attributes :id, :external_id, :recording_date, :recording_url, :assessors, :participants,
               :assessment_center_date_and_time, :transcription_url, :transcription_text,
               :disable_transcript_download, :hide_participant_video

    def campaign_options
      context && context[:campaign]&.campaign_options
    end

    def assessor_view?
      context&.dig(:assessor_view) == true
    end

    def recording_url
      return nil if hide_participant_video

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
      return nil if disable_transcript_download

      object.transcription_file.attached? ? object.transcription_file.url : nil
    end

    def disable_transcript_download
      assessor_view? && campaign_options&.disable_transcript_download == true
    end

    def hide_participant_video
      assessor_view? && campaign_options&.hide_participant_video == true
    end

    def transcription_text
      return nil unless object.transcription_file.attached?

      object.transcription_file.download
    end
  end
end
