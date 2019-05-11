# frozen_string_literal: true

require 'rails_helper'

describe Exports::Reports::ReportDataExport do
  describe '.export' do
    let(:report)           { create(:report, data_configuration: data_configuration) }
    let(:client)           { double('client') }
    let(:norm)             { double('norm', id: 1) }
    let(:factors_norm)     { double('factors_norm') }
    let(:membership)       { double('membership', user: user, id: 1) }
    let(:user)             { double('user', first_name: 'Jon', last_name: 'Snow') }
    let(:assigns_report)   { double('assigns_report') }
    let(:aliases)          { double('aliases') }
    let(:assign) do
      double('assign', membership: membership,
                       membership_id: membership.id,
                       external_results: external_results,
                       assessment_id: 1,
                       norm_data: norm_data,
                       scoring: scoring)
    end
    let(:factor) do
      double('factor', id: 1,
                       name: 'Test factor',
                       parent_id: nil,
                       aliases: aliases,
                       sub_factor_ids: [2, 3],
                       factors_norms: [factors_norm])
    end

    let(:report_data_export) { described_class.new(report, client) }

    # ATTRIBUTES
    # Contains data of External Results from Mindmill or Hogan
    let(:external_results) { { 'ed.attempted' => 1, 'ed.correct' => 2 } }
    # Contains Data Configuration for Report
    let(:data_configuration) { YAML.safe_load(file_fixture('reports/data_configuration.yml').read) }
    # Contains Norm data
    let(:norm_data) { { 'id' => 1, 'type' => 'YTI' } }
    # Contains scoring results
    let(:scoring) do
      {
        '1' => { 'results' => [1, 2, 3] },
        '2' => { 'results' => [4, 5, 6] }
      }
    end

    # SUBJECT
    # subject { described_class.new(report, client) }

    before(:each) do
      allow(Report).to        receive(:find).and_return(report)
      allow(Client).to        receive(:find).and_return(client)
      allow(Factor).to        receive(:find).and_return(factor)
      allow(Norm).to          receive(:find).and_return(norm)
      allow(FactorsNorm).to   receive(:find_by!).and_return(factors_norm)
      allow(factors_norm).to  receive(:detect_normed_result).and_return(3)
      allow(aliases).to  receive(:find_by).and_return(nil)
    end

    context '#to_xlsx' do
      let(:assigns_with_mocked_find_each) do
        relation = instance_double('Assign::ActiveRecord_Relation')
        receive_yield = receive(:find_each)
        [assign].each do |obj|
          receive_yield = receive_yield.and_yield(obj)
        end
        allow(relation).to receive_yield
        relation
      end

      it do
        allow(report_data_export).to receive(:fetch_factor_label).with(factor.id).and_return(factor.name)
        allow(report_data_export).to receive(:current_level_assigns).and_return([assign])
        sheet = report_data_export.to_xlsx.workbook.worksheets.first

        expect(sheet).to have_cells(['User Details', '', 'Error Detection', '', 'Thriving Index', '']).in_row(0)
        expect(sheet).to have_cells(['First Name', 'Last Name', 'Attempted', 'Correct', 'Test factor', 'Fit Score']).in_row(1)
        expect(sheet).to have_cells(["Jon", "Snow", 1, 2, 3, 3.0]).in_row(2)
      end
    end
  end
end
