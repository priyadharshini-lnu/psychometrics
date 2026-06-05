# frozen_string_literal: true

class IdpSetting < ApplicationRecord
  include ApplicationConfigurationLoggable

  belongs_to :project
  include Tenantable

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id]
  end
end
