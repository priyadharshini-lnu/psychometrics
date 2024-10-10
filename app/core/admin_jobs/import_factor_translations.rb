# frozen_string_literal: true

module AdminJobs
  class ImportFactorTranslations < BaseExportCsv
    def valid?
      dimension.present?
    end

    def call
      rows = CSV.parse(URI(record.file.url).open, headers: :first_row).map(&:to_h)
      ::Dimensions::ImportTranslations.call!(dimension, rows, record)

      broadcast :ok
    end

    def generate_title_link
      {
        href: "/administration/dimensions/#{dimension.id}/factors",
        label: dimension.name
      }
    end

    def dimension
      @dimension ||= Dimension.find_by(id: record.data['dimension_id'])
    end
  end
end
