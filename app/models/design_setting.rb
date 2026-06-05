# frozen_string_literal: true

class DesignSetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  include ActiveStorageAttachable

  LOGIN_BOX_POSITIONS = %i[left auto right].freeze
  MAX_ALT_TEXT_LENGTH = 100
  ALLOWED_CHARACTERS_REGEX = /\A[a-zA-Z0-9\s\-.,()&']+\z/

  belongs_to :project
  include Tenantable

  before_validation :set_default_logo_alt_texts, on: :create

  has_one_image_attachment :logo, variants: [:thumb]
  has_one_image_attachment :background, variants: [:thumb]
  has_one_image_attachment :background_overlay, variants: [:thumb]
  has_one_image_attachment :secondary_logo, variants: [:thumb]

  def attachment_storage_path(attribute_name, filename)
    "public/projects/#{project.id}/design_setting/#{attribute_name}/#{filename}"
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id]
  end

  private

  def set_default_logo_alt_texts
    self.logo_alt_text ||= project.name
    self.secondary_logo_alt_text ||= project.name
  end
end
