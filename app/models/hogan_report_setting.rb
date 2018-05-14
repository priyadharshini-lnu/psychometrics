class HoganReportSetting < ApplicationRecord
  belongs_to :report

  validates :hogan_report_id, presence: true
  validates :hogan_norm_id, presence: true
  validates :hogan_language_id, presence: true
end
