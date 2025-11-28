# frozen_string_literal: true

module DailyCo
  class TranscriptStartedEvent
    def self.process(payload)
      room = MeetingRoom.find_by(name: payload['room_name'])
      return Rails.logger.warn("MeetingRoom not found for name: #{payload['room_name']}") unless room

      recording = MeetingRecording.find_or_initialize_by(meeting_room: room,
                                                         meeting_session_id: payload['mtg_session_id'])
      recording.transcription_status = payload['status']
      recording.transcription_external_id = payload['id']
      recording.save!
    end
  end
end
