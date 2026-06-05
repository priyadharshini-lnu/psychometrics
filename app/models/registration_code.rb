# frozen_string_literal: true

class RegistrationCode < ApplicationRecord
  audited

  belongs_to :end_level, class_name: 'Client'
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  include Tenantable

  has_many :license_usages, dependent: :nullify

  def log_attribute_for_delete
    slice(:campaign_id, :project_id, :code)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end
end
