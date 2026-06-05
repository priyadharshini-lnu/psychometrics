# frozen_string_literal: true

class MeetingRecording < ApplicationRecord
  include ActiveStorageAttachable

  belongs_to :meeting_room
  include Tenantable

  tenant_source :meeting_room

  enum :status, { started: 0, stopped: 1, finished: 2, failed: 3 }
  enum :transcription_status, { not_enabled: 0, t_in_progress: 1, t_finished: 2, t_error: 3 }

  validates :status, presence: true
  validates :transcription_status, presence: true
  validates :external_id, presence: true, if: -> { status == 'finished' }
  validates :s3key, presence: true, if: -> { status == 'finished' }
  validates :transcription_external_id, presence: true, if: -> { transcription_status == 't_finished' }
  validates :transcription_s3key, presence: true, if: -> { transcription_status == 't_finished' }

  has_one_attachment :recording_file,
                     service: Settings.storage.dailyco_storage_service,
                     content_type: %w[video/mp4 video/webm]

  has_one_attachment :transcription_file,
                     service: Settings.storage.dailyco_storage_service,
                     content_type: %w[text/plain text/vtt]

  after_commit :enqueue_attach_recording_file_job, if: :status_just_finished?
  after_update_commit :enqueue_attach_transcription_file_job, if: :transcription_status_just_finished?

  def attachment_storage_path(_attribute_name, filename, *_args)
    filename = filename.to_s
    if filename =~ /^[a-z0-9]{24,}_/ && filename.include?('/')
      filename = filename.split('_', 2).last
    end
    filename
  end

  private

  def status_just_finished?
    status == 'finished' &&
      (saved_change_to_status? || previous_changes.key?('status')) &&
      !recording_file.attached?
  end

  def transcription_status_just_finished?
    saved_change_to_transcription_status? &&
      transcription_status == 't_finished' &&
      transcription_status_before_last_save != 't_finished' &&
      !transcription_file.attached?
  end

  def enqueue_attach_recording_file_job
    ::MeetingRecordings::AttachUploadedRecordingJob.perform_later(self)
  end

  def enqueue_attach_transcription_file_job
    ::MeetingRecordings::AttachUploadedTranscriptionFileJob.perform_later(self)
  end
end
