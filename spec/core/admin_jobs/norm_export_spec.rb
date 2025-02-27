# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobs::NormExport, type: :job do
  let(:norm) { create(:norm) }
  let(:factor_norms) { create_list(:factors_norm, 3, norm: norm) }

  let(:job_record) do
    create(:admin_job_record, operation: :norm_export, data: { norm_id: norm.id })
  end
  let(:job) { described_class.new(job_record) }

  it 'first row in csv contains dimension name and headers' do
    described_class.call!(job_record)
    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
    actual_first_row = csv[0]

    expected_first_row = [
      norm.dimension.name,
      'Factors',
      'Very Low',
      nil,
      'Low',
      nil,
      'Average',
      nil,
      'High',
      nil,
      'Very High',
      nil
    ]

    expect(actual_first_row).to eq(expected_first_row)
  end

  it 'csv contains each factor norm as separate row' do
    described_class.call!(job_record)
    csv = CsvUtf8.to_array(active_storage_file_path(job_record.file))
    actual_factor_norm_row = csv[1]
    factor_norm = norm.factors_norms.order(id: :asc).first

    expected_factor_norm_row = [
      nil,
      factor_norm.factor.name,
      factor_norm.props[0]['score_from'].to_s,
      factor_norm.props[0]['score_to'].to_s,
      factor_norm.props[1]['score_from'].to_s,
      factor_norm.props[1]['score_to'].to_s,
      factor_norm.props[2]['score_from'].to_s,
      factor_norm.props[2]['score_to'].to_s,
      factor_norm.props[3]['score_from'].to_s,
      factor_norm.props[3]['score_to'].to_s,
      factor_norm.props[4]['score_from'].to_s,
      factor_norm.props[4]['score_to'].to_s
    ]

    expect(actual_factor_norm_row).to eq(expected_factor_norm_row)
  end
end
