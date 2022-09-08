# frozen_string_literal: true

class UserProfile < ApplicationRecord
  PROFILE_FIELDS = %i[age photo gender timezone locale custom_fields].freeze

  belongs_to :user
  mount_uploader :photo, ImageUploader
end
