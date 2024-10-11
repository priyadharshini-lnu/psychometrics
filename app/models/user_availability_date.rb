# frozen_string_literal: true

class UserAvailabilityDate < ApplicationRecord
  audited

  belongs_to :user
  has_many :user_availability_days, dependent: :destroy

  def self.ransackable_attributes(_auth_object = nil)
    %w[id start_date end_date]
  end
end
