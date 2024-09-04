# frozen_string_literal: true

class UserProfile < ApplicationRecord
  audited

  include ActiveStorageAttachable

  PROFILE_FIELDS = %i[age photo gender locale custom_fields].freeze

  enum gender: { male: 0, female: 1, not_disclosed: 2 }

  before_save :set_age_updated_at, if: :age_changed?
  before_save do
    self.locale = locale.presence
  end

  belongs_to :user

  has_one_image_attachment :photo, variants: [:icon]

  def attachment_storage_path(attribute_name, filename)
    "public/user_profile/#{user_id}/#{attribute_name}/#{filename}"
  end

  def set_age_updated_at
    self.age_updated_at = Time.current
  end

  def profile_locale
    locale
  end

  def profile_locale=(val)
    self[:locale] = val
  end
end
