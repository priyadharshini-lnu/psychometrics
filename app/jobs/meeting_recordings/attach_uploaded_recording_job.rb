# frozen_string_literal: true

module MeetingRecordings
  class AttachUploadedRecordingJob < ApplicationJob
    queue_as :default

    def perform(recording)
      ::MeetingRecordings::AttachUploadedRecording.call!(recording)
    end
  end
end
