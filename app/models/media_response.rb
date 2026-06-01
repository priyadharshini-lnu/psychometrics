# frozen_string_literal: true

class MediaResponse < ApplicationRecord
  audited

  include EncodableId
  include ActiveStorageAttachable

  has_one_attachment :asset, service: Settings.storage.private_storage_service
  has_one :transcription, as: :transcribable, dependent: :destroy

  belongs_to :question
  belongs_to :users_result

  include Tenantable

  belongs_to :users_assessment
  tenant_source :users_result

  delegate :status, to: :transcription, prefix: true, allow_nil: true

  validate :verify_multiple_take_limit, on: :create

  before_create :set_user_selected

  def transcription_completed?
    transcription&.completed?
  end

  def attachment_storage_path(attribute_name, filename)
    project_id = users_result.campaign.project_id
    "private/projects/#{project_id}/media_response/#{users_result_id}/#{question_id}/#{id}/#{attribute_name}/#{filename}" # rubocop:disable Layout/LineLength
  end

  def filename
    asset&.filename.to_s
  end

  def video_file_path(filename)
    attachment_storage_path('asset', filename)
  end

  def verify_multiple_take_limit
    return unless question.type == 'VideoResponse'

    maximum_takes = question.props['maxTakes']

    return if maximum_takes.blank?

    media_responses_count = question.media_responses.
                            where(users_result_id: users_result&.id).count

    errors.add(:base, :max_takes_limit_reached) if media_responses_count >= maximum_takes
  end

  def set_user_selected
    return unless question.type == 'VideoResponse'

    media_responses_exists = question.media_responses.exists?(users_result_id: users_result&.id)

    self.user_selected = true unless media_responses_exists
  end

  def save_transcription_failed!(error_details)
    transcription_record.update!(error_details: error_details, status: :failed, text: '')
  end

  def save_transcription_completed!(text, metadata: {}, segments: [])
    transcription_record.update!(text: text, metadata: metadata, segments: segments, status: :completed)
  end

  def save_transcription_status!(status)
    transcription_record.update!(status: status)
  end

  def transcription_not_requested?
    transcription.nil? || transcription.not_requested?
  end

  private

  def assign_key_to_blob(action, attribute, filename)
    action.blob.key = attachment_storage_path(attribute, filename)
  end

  def transcription_record
    Transcription.find_or_create_by!(transcribable: self)
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    Transcription.find_by!(transcribable: self)
  end
end
