# frozen_string_literal: true

module Administration
  class ReportFamilySerializer < Panko::Serializer
    attributes :id, :name, :reports

    def reports
      object.reports.where(category: :common).order(:name).map { |report| report.slice(:id, :name) }
    end
  end
end
