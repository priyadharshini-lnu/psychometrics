# frozen_string_literal: true

class DesignSetting < ApplicationRecord
  audited

  include ActiveStorageAttachable

  LOGIN_BOX_POSITIONS = %i[left auto right].freeze

  belongs_to :project

  has_one_image_attachment :logo, variants: [:thumb]
  has_one_image_attachment :background, variants: [:thumb]
  has_one_image_attachment :secondary_logo, variants: [:thumb]

  def attachment_storage_path(attribute_name, filename)
    "public/projects/#{project.id}/design_setting/#{attribute_name}/#{filename}"
  end
end
