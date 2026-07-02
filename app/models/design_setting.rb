# frozen_string_literal: true

class DesignSetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  include ActiveStorageAttachable

  LOGIN_BOX_POSITIONS = %i[left auto right].freeze
  MAX_ALT_TEXT_LENGTH = 100
  ALLOWED_CHARACTERS_REGEX = /\A[a-zA-Z0-9\s\-.,()&']+\z/

  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :client, optional: true

  validates :project_id, presence: true, unless: :client_id
  validates :client_id, presence: true, unless: :project_id

  include Tenantable

  before_validation :set_default_logo_alt_texts, on: :create

  has_one_image_attachment :logo, variants: [:thumb]
  has_one_image_attachment :background, variants: [:thumb]
  has_one_image_attachment :background_overlay, variants: [:thumb]
  has_one_image_attachment :secondary_logo, variants: [:thumb]

  def owner
    project_id.present? ? project : client
  end

  def attachment_storage_path(attribute_name, filename)
    "public/projects/#{owner.id}/design_setting/#{attribute_name}/#{filename}"
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id client_id]
  end

  private

  def set_default_logo_alt_texts
    self.logo_alt_text ||= owner.name
    self.secondary_logo_alt_text ||= owner.name
  end
end
