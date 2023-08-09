# frozen_string_literal: true

module Administration
  class ReportFamilySerializer < ActiveModel::Serializer
    attributes :id, :name, :reports

    def reports
      object.reports.order(:name).map { |report| report.slice(:id, :name) }
    end
  end
end
