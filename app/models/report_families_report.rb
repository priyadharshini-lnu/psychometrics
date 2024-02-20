# frozen_string_literal: true

class ReportFamiliesReport < ApplicationRecord
  scope :filterable_fields, lambda { |search_term|
    joins(:report).where('reports.name ILIKE ?', "%#{search_term}%")
  }
  audited

  belongs_to :report
  belongs_to :report_family

  before_save -> { self.external_package_id = external_package_id.presence }

  class << self
    def ransackable_scopes(_auth_object = nil)
      %i[filterable_fields]
    end
  end
end
