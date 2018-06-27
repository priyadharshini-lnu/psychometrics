class HoganReportSetting < ApplicationRecord
  belongs_to :report

  validates :hogan_report_id, presence: true
  validates :hogan_norm_id, presence: true
  validates :hogan_language_id, presence: true

  before_validation :set_norm_id_and_language_id

  private

  def set_norm_id_and_language_id
    reports = Settings.hogan.map(&:reports).flatten
    report = reports.find { |r| r.report_id == self.hogan_report_id }

    self.hogan_norm_id = report.norm_id
    self.hogan_language_id = report.language_id
  end
end
