# frozen_string_literal: true

require 'rails_helper'

describe Reports::ExportData do
  describe '.export' do
    let(:data_configuration) { YAML.safe_load(file_fixture('reports/data_configuration.yml').read) }
    let(:report)           { create(:report, data_configuration: data_configuration) }
    let(:campaign)         { double('campaign', id: 1) }
    let(:user)             { create(:user, first_name: 'Jon', last_name: 'Snow') }
    let(:external_results) { { 'ed.attempted' => 1, 'ed.correct' => 2 } }
    let(:scoring) do
      {
        '1' => { 'results' => [1, 2, 3], 'norm_score' => 3 },
        '2' => { 'results' => [4, 5, 6], 'norm_score' => 5.5 }
      }
    end
    let(:user_result) do
      create(:users_result,
             subject: user,
             external_results: external_results,
             scoring: scoring)
    end

    before(:each) do
      allow_any_instance_of(UsersResult).to receive(:assessment_id).and_return(1)
    end

    context '#to_xlsx' do
      let(:assigns_with_mocked_find_each) do
        relation = instance_double('Assign::ActiveRecord_Relation')
        receive_yield = receive(:find_each)
        [user_result].each do |obj|
          receive_yield = receive_yield.and_yield(obj)
        end
        allow(relation).to receive_yield
        relation
      end

      it do
        allow(Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ factor_names: { 1 => 'Test factor1', 2 => 'Test factor2' } })
        allow_any_instance_of(described_class).to receive(:users_results).
          and_return(UsersResult.where(id: user_result.id))

        sheet = described_class.call!(report, campaign).workbook.worksheets.first

        # Update to include MappedValue
        expect(sheet).to have_cells(['User Details', '', 'Error Detection', '', 'Thriving Index', '', '']).in_row(0)
        expect(sheet).to have_cells(['First Name',
                                     'Last Name',
                                     'Attempted',
                                     'Correct',
                                     'Test factor1',
                                     'Fit Score',
                                     'Overall Aspiration Score']).in_row(1)
        expect(sheet).to have_cells(['Jon', 'Snow', 1, 2, 3, 4.67, nil]).in_row(2)
      end
    end
  end
end
