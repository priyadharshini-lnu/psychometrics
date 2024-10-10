# frozen_string_literal: true

class PrivacySetting < ApplicationRecord
  audited

  extend Mobility

  belongs_to :project

  translates :custom_privacy_consent_text

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id]
  end
end
