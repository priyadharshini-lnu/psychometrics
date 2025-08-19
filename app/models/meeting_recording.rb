# frozen_string_literal: true

class MeetingRecording < ApplicationRecord
  include ActiveStorageAttachable

  belongs_to :meeting_room

  enum :status, { started: 0, stopped: 1, finished: 2, failed: 3 }

  validates :external_id, presence: true
  validates :status, presence: true

  has_one_attachment :recording_file,
                     service: Settings.storage.dailyco_storage_service,
                     content_type: %w[video/mp4 video/webm]

  after_update_commit :enqueue_attach_recording_file_job, if: :status_just_finished?

  def attachment_storage_path(_attribute_name, filename, *_args)
    filename = filename.to_s
    if filename =~ /^[a-z0-9]{24,}_/ && filename.include?('/')
      filename = filename.split('_', 2).last
    end
    filename
  end

  private

  def status_just_finished?
    saved_change_to_status? &&
      status == 'finished' &&
      status_before_last_save != 'finished' &&
      !recording_file.attached?
  end

  def enqueue_attach_recording_file_job
    ::MeetingRecordings::AttachUploadedRecordingJob.perform_later(self)
  end
end
