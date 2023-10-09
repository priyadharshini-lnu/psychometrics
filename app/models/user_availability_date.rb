# frozen_string_literal: true

class UserAvailabilityDate < ApplicationRecord
  belongs_to :user
  has_many :user_availability_days, dependent: :destroy

  def self.ransackable_scopes(_auth_object = nil)
    %i[end_date_gteq]
  end
end
