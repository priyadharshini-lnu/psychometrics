# frozen_string_literal: true

class ReportFamiliesReport < ApplicationRecord
  audited

  belongs_to :report
  belongs_to :report_family

  before_save -> { self.external_package_id = external_package_id.presence }
end
