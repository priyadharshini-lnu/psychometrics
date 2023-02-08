# frozen_string_literal: true

require 'carrierwave/storage/fog'

class MediaResponse < ApplicationRecord
  include EncodableId
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  mount_uploader :asset, Private::MediaResponseUploader

  has_one_attached :as_asset, service: Settings.storage.private_storage_service
  # TODO: check filename_format validation?
  validates :as_asset, content_type: proc { allowed_content_type }
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :asset

  def allowed_content_type
    return allowed_file_types_from_question if question.props['allowedFileTypes']

    return %w[mp4] if question.type == 'VideoResponse'

    return %w[wav] if question.type == 'AudioResponse'
  end

  def allowed_file_types_from_question
    return question.props['allowedFileTypes'].concat(['jpeg']) if question.props['allowedFileTypes'].include?('jpg')

    question.props['allowedFileTypes']
  end

  belongs_to :users_assessment
  belongs_to :question
  belongs_to :assign
  belongs_to :users_result

  validates :asset, filename_format: true
  validate :verify_multiple_take_limit, on: :create

  before_create :set_user_selected

  def filename
    asset&.filename&.split('/')&.last
  end

  def video_file_path
    asset.key.sub('${filename}', 'video.mp4')
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
