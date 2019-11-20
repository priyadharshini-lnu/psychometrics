# frozen_string_literal: true

require 'rails_helper'

describe Reports::CopyReport do
  context '.call' do
    let(:report) { double('report', data_configuration: data_configuration, id: 1) }
    let(:norm)             { double('norm', id: 1) }
    let(:factors_norm)     { double('factors_norm') }
    let(:factor) do
      double('factor', id: 1,
                       name: 'Test factor',
                       parent_id: nil,
                       sub_factor_ids: [2, 3],
                       aliases: aliases,
                       factors_norms: [factors_norm])
    end

    let(:copy_report_command) { described_class.new(report.id) }
    let(:data_configuration) { YAML.safe_load(file_fixture('reports/data_configuration.yml').read) }
    let(:norm_data) { { 'id' => 1, 'type' => 'YTI' } }

    context 'CopyReport' do
      subject { Reports::CopyReport.call(build_results_command, report.id) }
    end
  end
end
