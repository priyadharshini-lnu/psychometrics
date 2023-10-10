# frozen_string_literal: true

require 'carrierwave/storage/fog'

class MediaResponse < ApplicationRecord
  audited

  include EncodableId
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  mount_uploader :asset, Private::MediaResponseUploader

  has_one_attachment :as_asset, service: Settings.storage.private_storage_service
  # TODO: add :asset content_type validation after ActiveStorage migration
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :asset

  def attachment_storage_path(attribute_name, filename)
    project_id = users_result ? users_result.campaign.project_id : assign.membership.project_membership.client_id

    "private/projects/#{project_id}/media_response/#{users_result_id || assign_id}/#{question_id}/#{attribute_name}/#{filename}" # rubocop:disable Layout/LineLength
  end

  belongs_to :users_assessment
  belongs_to :question
  belongs_to :assign
  belongs_to :users_result

  attr_accessor :skip_filename_validation

  validates :asset, filename_format: true, unless: :skip_filename_validation
  validate :verify_multiple_take_limit, on: :create

  before_create :set_user_selected

  def filename
    asset&.filename&.split('/')&.last
  end

  def video_file_path(filename)
    asset.key.sub('${filename}', filename)
  end

  def verify_multiple_take_limit
    return unless question.type == 'VideoResponse'

    maximum_takes = question.props['maxTakes']

    return if maximum_takes.blank?

    media_responses_count = question.media_responses.
                            where(assign_id: assign&.id, users_result_id: users_result&.id).count

    errors.add(:base, :max_takes_limit_reached) if media_responses_count >= maximum_takes
  end

  def set_user_selected
    return unless question.type == 'VideoResponse'

    media_responses_exists = question.media_responses.exists?(assign_id: assign&.id, users_result_id: users_result&.id)

    self.user_selected = true unless media_responses_exists
  end
end
