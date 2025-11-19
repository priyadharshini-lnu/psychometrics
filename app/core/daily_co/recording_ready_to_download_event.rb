# frozen_string_literal: true

module DailyCo
  class RecordingReadyToDownloadEvent
    def self.process(payload)
      room = MeetingRoom.find_by(name: payload['room_name'])
      return Rails.logger.warn("MeetingRoom not found for name: #{payload['room_name']}") unless room

      recording = MeetingRecording.find_or_initialize_by(meeting_room: room,
                                                         meeting_session_id: extract_mtg_session_id(payload))
      recording.status = payload['status']
      recording.s3key = payload['s3_key']
      recording.external_id = payload['recording_id']
      recording.save!
    end

    def self.extract_mtg_session_id(payload)
      s3_key = payload['s3_key']
      parts = s3_key.split('/')
      payload['recording_id'] == parts[2] ? nil : parts[2]
    end
  end
end
