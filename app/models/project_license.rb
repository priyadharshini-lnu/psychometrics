# frozen_string_literal: true

class ProjectLicense < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  belongs_to :license
  include Tenantable

  validates :used_number, numericality: { greater_than_or_equal_to: 0 }

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
end
