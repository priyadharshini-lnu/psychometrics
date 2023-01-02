# frozen_string_literal: true

class DesignSetting < ApplicationRecord
  LOGIN_BOX_POSITIONS = %i[left auto right].freeze

  belongs_to :project

  mount_base64_uploader :logo, ImageUploader
  mount_base64_uploader :background, BackgroundUploader
  mount_base64_uploader :secondary_logo, ImageUploader
end
