# frozen_string_literal: true

class IdpSetting < ApplicationRecord
  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id]
  end
end
