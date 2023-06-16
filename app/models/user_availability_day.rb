# frozen_string_literal: true

class UserAvailabilityDay < ApplicationRecord
  belongs_to :user
  has_many :user_availability_date, dependent: :destroy
end
