# frozen_string_literal: true

module MeetingRecordings
  class DeleteExpiredRecordingsJob < ApplicationJob
    def perform
      MeetingRecording.includes(meeting_room: { meetable: { project: :privacy_setting } }).find_each do |recording|
        meetable = recording.meeting_room.meetable
        project = meetable.try(:project)
        privacy_setting = project.try(:privacy_setting)
        expiry = privacy_setting&.video_call_recording_expiry_in_seconds

        next unless expiry.present? && expiry.positive?

        if recording.created_at < Time.current - expiry
          recording.destroy
        end
      end
    end
  end
end
