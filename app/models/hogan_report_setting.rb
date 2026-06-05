# frozen_string_literal: true

class HoganReportSetting < ApplicationRecord
  audited

  belongs_to :report

  include Tenantable

  tenant_source :report

  before_create :set_hogan_details

  private

  def set_hogan_details
    return unless hogan_details

    self.hogan_suitability_id = hogan_details.suitability_id
    self.hogan_norm_id = hogan_details.norm_id
    self.hogan_language_id = hogan_details.language_id
  end

  def hogan_details
    @hogan_details ||= Settings.providers.hogan.reports.detect { |r| r.id == hogan_report_id }
  end
end
