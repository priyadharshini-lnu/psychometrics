# frozen_string_literal: true

class ReportFamiliesReport < ApplicationRecord
  belongs_to :report
  belongs_to :report_family
end
