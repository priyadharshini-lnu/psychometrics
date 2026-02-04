# frozen_string_literal: true

class MhsReportSetting < ApplicationRecord
  audited

  belongs_to :report

  validates :mhs_report_id, presence: true

  before_save -> { self.mhs_report_id = mhs_report_id&.downcase }
end
