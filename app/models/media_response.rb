# frozen_string_literal: true

class MediaResponse < ApplicationRecord
  audited

  include EncodableId
  include ActiveStorageAttachable

  has_one_attachment :asset, service: Settings.storage.private_storage_service

  def attachment_storage_path(attribute_name, filename)
    project_id = users_result.campaign.project_id
    "private/projects/#{project_id}/media_response/#{users_result_id}/#{question_id}/#{id}/#{attribute_name}/#{filename}" # rubocop:disable Layout/LineLength
  end

  belongs_to :users_assessment
  belongs_to :question
  belongs_to :users_result

  validate :verify_multiple_take_limit, on: :create

  before_create :set_user_selected

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

  private

  def assign_key_to_blob(action, attribute, filename)
    action.blob.key = attachment_storage_path(attribute, filename)
  end
end
