# frozen_string_literal: true

class ClientPrivacySetting < ApplicationRecord
  audited

  extend Mobility

  belongs_to :client

  def self.ransackable_attributes(_auth_object = nil)
    %w[id client_id]
  end
end
