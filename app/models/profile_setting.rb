# frozen_string_literal: true

class ProfileSetting < ApplicationRecord
  belongs_to :project
  has_many :profile_fields
  has_many :questions, through: :profile_fields
end
