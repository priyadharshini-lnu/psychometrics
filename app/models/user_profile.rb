# frozen_string_literal: true

class UserProfile < ApplicationRecord
  audited

  include ActiveStorageAttachable

  PROFILE_FIELDS = %i[age photo gender locale custom_fields].freeze

  enum :gender, { male: 0, female: 1, not_disclosed: 2 }

  before_save :set_age_updated_at, if: :age_changed?
  before_save do
    self.locale = locale.presence
  end

  belongs_to :user
  include Tenantable

  tenant_source :user

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

  def custom_fields
    profile_field_values.includes(:profile_field).to_h { |pfv| [pfv.profile_field.question_id, pfv.value] }
  end

  def custom_fields=(values)
    fields = values.filter_map do |question_id, value|
      profile_field = profile_fields.find_by(question_id: question_id.to_s)
      next unless profile_field

      field = profile_field_values.find_or_initialize_by(profile_field: profile_field)
      field.value = value
      field
    end
    ProfileFieldValue.import(fields, on_duplicate_key_update: %i[string_value numeric_value])
  end
end
