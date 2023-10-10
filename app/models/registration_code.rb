# frozen_string_literal: true

class RegistrationCode < ApplicationRecord
  audited

  belongs_to :end_level, class_name: 'Client'
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  has_many :license_usages, dependent: :nullify

  def log_attribute_for_delete
    slice(:campaign_id, :project_id, :code)
  end
end
