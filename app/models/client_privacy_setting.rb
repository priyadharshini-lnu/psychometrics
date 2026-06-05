# frozen_string_literal: true

class ClientPrivacySetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  belongs_to :client

  include Tenantable

  validates :client, presence: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id client_id]
  end
end
