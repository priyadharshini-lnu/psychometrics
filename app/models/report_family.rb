# frozen_string_literal: true

class ReportFamily < ApplicationRecord
  include RansackSearchableFields

  audited

  has_many :report_families_reports
  has_many :reports, through: :report_families_reports, source: :report
  has_many :assessments, through: :reports, source: :assessment
  has_many :licenses, dependent: :restrict_with_error
  has_many :license_usages, through: :licenses
  has_many :clients, through: :licenses, source: :client

  validates :name, presence: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end
end
