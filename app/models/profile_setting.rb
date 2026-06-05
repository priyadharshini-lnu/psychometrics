# frozen_string_literal: true

class ProfileSetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  belongs_to :project
  include Tenantable

  has_many :profile_fields
  has_many :questions, through: :profile_fields
  validates :update_in, inclusion: { in: [1, 3, 6, 12] }, allow_nil: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id]
  end
end
