# frozen_string_literal: true

module AdminJobs
  class NormExport < BaseExportCsv
    def generate_details
      [['Norm', file_link || norm.name]]
    end

    private

    def headers
      norm.decorate.xls_levels_row
    end

    def data_row(factor_norm)
      current_row = [nil, nil, factor_norm[:name]]
      FactorsNorm::LEVELS.each do |level|
        cell = factor_norm[:factors_norms_props].find { |c| c['level'] == level }
        current_row << cell.try(:[], 'score_from')
        current_row << cell.try(:[], 'score_to')
      end
      current_row
    end

    def records_for_export
      FactorsNorm.export_structured_hash(norm)
    end

    def write_csv_headers(csv)
      dimension_name = norm.dimension.name
      csv << ([norm.name, dimension_name, 'Factors'] + headers)
    end

    def file_name
      "norm-#{norm.id}.#{Time.zone.today}.csv"
    end

    def norm
      @norm ||= Norm.find_by(id: record.data['norm_id'])
    end
  end
end
