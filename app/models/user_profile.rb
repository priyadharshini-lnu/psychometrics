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
  after_save :sync_data, if: proc { custom_fields_previously_changed? }

  belongs_to :user
  has_one_image_attachment :photo, variants: [:icon]

  delegate :profile_fields, to: :user

  has_many :profile_field_values, dependent: :destroy

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

  def profile_field_values
    ProfileFieldValue.where(user_profile_id: id, profile_field_id: profile_fields.pluck(:id))
  end

  def sync_data
    return unless custom_fields

    custom_fields.each do |question_id, value|
      field = profile_fields.find_by(question_id: question_id)
      next unless field

      profile_value = ProfileFieldValue.find_or_initialize_by(profile_field_id: field.id, user_profile_id: id)
      profile_value.value = value
      profile_value.save!
    end
  end
end
