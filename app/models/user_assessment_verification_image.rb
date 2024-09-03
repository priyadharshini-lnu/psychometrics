# frozen_string_literal: true

require 'carrierwave/storage/fog'

class UserAssessmentVerificationImage < ApplicationRecord
  belongs_to :user_assessment

  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  mount_uploader :file, Private::ImageDirectUploader

  has_one_attachment :as_file, service: Settings.storage.private_storage_service
  # TODO: add :asset content_type validation after ActiveStorage migration
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :file

  def attachment_storage_path(attribute_name, filename)
    project_id = user_assessment.project.id

    "private/projects/#{project_id}/user_verification_images/#{user_assessment.id}/#{attribute_name}/#{filename}"
  end
end
