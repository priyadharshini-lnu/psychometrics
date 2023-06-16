# frozen_string_literal: true

class UserAvailabilityDate < ApplicationRecord
  belongs_to :user
  has_many :user_availability_days, dependent: :destroy
end
