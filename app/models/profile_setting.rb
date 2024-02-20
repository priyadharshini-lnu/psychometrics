# frozen_string_literal: true

class ProfileSetting < ApplicationRecord
  audited

  belongs_to :project
  has_many :profile_fields
  has_many :questions, through: :profile_fields
  validates :update_in, inclusion: { in: [1, 3, 6, 12] }, allow_nil: true
end
