# frozen_string_literal: true

class UserProfile < ApplicationRecord
  PROFILE_FIELDS = %i[age photo gender timezone locale custom_fields].freeze

  enum gender: { male: 0, female: 1, not_disclosed: 2 }

  before_save :set_age_updated_at, if: :age_changed?

  belongs_to :user
  mount_uploader :photo, ImageUploader

  def set_age_updated_at
    self.age_updated_at = Time.current
  end
end
