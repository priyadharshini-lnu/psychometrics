# frozen_string_literal: true

class UserBooking < ApplicationRecord
  belongs_to :user
  belongs_to :booked_by_resource, polymorphic: true
end
