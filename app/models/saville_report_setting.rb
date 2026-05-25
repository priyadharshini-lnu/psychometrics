# frozen_string_literal: true

class SavilleReportSetting < ApplicationRecord
  audited

  belongs_to :report
  include Tenantable

  tenant_source :report

  validates :saville_report_id, presence: true

  before_save -> { self.saville_report_id = saville_report_id&.downcase }
end
