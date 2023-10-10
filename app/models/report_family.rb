# frozen_string_literal: true

class ReportFamily < ApplicationRecord
  audited

  has_many :report_families_reports
  has_many :reports, through: :report_families_reports, source: :report
  has_many :assessments, through: :reports, source: :assessment
  has_many :licenses
  has_many :license_usages, through: :licenses
  has_many :clients, through: :licenses, source: :client

  validates :name, presence: true
end
