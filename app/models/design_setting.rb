# frozen_string_literal: true

class DesignSetting < ApplicationRecord
  LOGIN_BOX_POSITIONS = %i[left auto right].freeze

  belongs_to :project

  mount_base64_uploader :logo, Public::ImageUploader
  mount_base64_uploader :background, Public::BackgroundUploader
  mount_base64_uploader :secondary_logo, Public::ImageUploader
end
