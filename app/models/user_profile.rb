# frozen_string_literal: true

class UserProfile < ApplicationRecord
  belongs_to :user
  mount_uploader :photo, ImageUploader
end
