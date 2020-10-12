# frozen_string_literal: true

require 'carrierwave/storage/fog'

class MediaResponse < ApplicationRecord
  include EncodableId

  mount_uploader :asset, MediaResponseUploader

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

    media_responses_exists = question.media_responses.where(
      assign_id: assign&.id, users_result_id: users_result&.id
    ).exists?

    self.user_selected = true unless media_responses_exists
  end
end
