# frozen_string_literal: true

module MeetingRecordings
  class AttachUploadedTranscriptionFileJob < ApplicationJob
    queue_as :default

    def perform(recording)
      ::MeetingRecordings::AttachUploadedTranscriptionFile.call!(recording)
    end
  end
end
