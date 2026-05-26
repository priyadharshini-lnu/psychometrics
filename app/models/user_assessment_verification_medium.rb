# frozen_string_literal: true

class UserAssessmentVerificationMedium < ApplicationRecord
  belongs_to :user_assessment
  include Tenantable

  tenant_source :user_assessment

  include ActiveStorageAttachable

  has_one_attachment :file, service: Settings.storage.private_storage_service

  enum :media_type, { video: 0, audio: 1 }, default: :video

  def attachment_storage_path(attribute_name, filename)
    project_id = user_assessment.project.id

    "private/projects/#{project_id}/user_verification_media/#{user_assessment.id}/#{attribute_name}/#{filename}"
  end

  private

  def assign_key_to_blob(action, attribute, filename)
    action.blob.key = attachment_storage_path(attribute, filename)
  end
end
