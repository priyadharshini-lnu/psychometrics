# frozen_string_literal: true

class UserAvailabilityDay < ApplicationRecord
  audited

  belongs_to :user
  belongs_to :user_availability_date
end
