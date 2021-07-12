# frozen_string_literal: true

require 'rails_helper'

describe Reports::BuildResults do
  context '.call' do
    let(:report)           { double('report', data_configuration: data_configuration, id: 1) }
    let(:user)             { create(:user, first_name: 'Jon', last_name: 'Snow') }
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
    let(:build_results_command) { described_class.new(report, [user_result]) }
    let(:external_results) { { 'ed.attempted' => 1, 'ed.correct' => 2 } }
    let(:data_configuration) { YAML.safe_load(file_fixture('reports/data_configuration.yml').read) }
    let(:mapped_value) { { 'value' => 3 } }

    context 'UserData' do
      let(:data) { { 'key' => 'first_name', 'label' => 'First Name' } }
      subject { Reports::ResultTypes::User.call(build_results_command, data) }

      it { is_expected.to eq(key: 'first_name', name: 'First Name', value: user.first_name, config_data: data) }
      context 'when data is not valid' do
        it do
          data['key'] = 'not_exists'

          is_expected.to eq(key: 'not_exists', name: 'First Name', value: nil, config_data: data)
        end
      end
    end

    context 'ExternalResults' do
      let(:data) { { 'key' => 'ed.attempted', 'assessmentId' => user_result.assessment_id, 'label' => 'Attempted' } }
      subject { Reports::ResultTypes::ExternalResults.call(build_results_command, data) }

      it {
        is_expected.to eq(key: 'ed.attempted', name: 'Attempted',
                             value: external_results['ed.attempted'], config_data: data)
      }

      context 'when data is not valid' do
        it do
          data['key'] = 'not_exists'
          is_expected.to eq(key: 'not_exists', name: 'Attempted', value: nil, config_data: data)
        end
        it do
          data['assessmentId'] = 'not_exists'
          is_expected.to eq(key: 'ed.attempted', name: 'Attempted', value: nil, config_data: data)
        end
      end
    end

    context 'NormedFactor' do
      before(:each) do
        allow(::Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ factor_names: { 1 => 'Test factor1', 2 => 'Test factor2' } })
      end

      let(:data) { { 'assessmentId' => user_result.assessment_id, 'factorId' => 1 } }
      subject { Reports::ResultTypes::NormedFactor.call(build_results_command, data) }

      it do
        data['factorId'] = 1
        is_expected.to eq(key: 1, name: 'Test factor1', value: 3, config_data: data)
      end

      it do
        data['factorId'] = 2
        is_expected.to eq(key: 2, name: 'Test factor2', value: 5.5, config_data: data)
      end

      it 'assessment ID not exists' do
        data['factorId'] = 1
        data['assessmentId'] = 'not_exists'
        is_expected.to eq(key: 1, name: 'Test factor1', value: nil, config_data: data)
      end
    end

    context 'Formula' do
      let(:data) { {} }
      subject { Reports::ResultTypes::Formula.call(build_results_command, data) }

      it 'data is blank' do
        is_expected.to eq(key: 'formula', name: nil, value: nil, config_data: data)
      end

      context 'normal flow' do
        before(:each) do
          allow(data).to receive(:dig).with('formula', 'args').and_return([{ 'type' => 'normed_factor' }])
          allow(Reports::ResultTypes::NormedFactor).to receive(:call).and_return(value: [1, 2, 3])
        end

        it 'AVERAGE' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('AVERAGE')
          is_expected.to eq(key: 'formula', name: nil, value: 2.0, config_data: data)
        end

        it 'MIN' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MIN')
          is_expected.to eq(key: 'formula', name: nil, value: 1, config_data: data)
        end

        it 'MAX' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MAX')
          is_expected.to eq(key: 'formula', name: nil, value: 3, config_data: data)
        end

        it 'ADD' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('ADD')
          is_expected.to eq(key: 'formula', name: nil, value: 6, config_data: data)
        end

        it 'SUBTRACT' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('SUBTRACT')
          is_expected.to eq(key: 'formula', name: nil, value: -4, config_data: data)
        end

        it 'MULTIPLY' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('MULTIPLY')
          is_expected.to eq(key: 'formula', name: nil, value: 6, config_data: data)
        end

        it 'DIVIDE' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('DIVIDE')
          is_expected.to eq(key: 'formula', name: nil, value: 0, config_data: data)
        end

        xit 'number of operands is wrong for ADD' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('ADD')
          expect { is_expected }.to raise_error(RuntimeError)
        end

        xit 'op is wrong' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('wrong')
          expect { is_expected }.to raise_error(RuntimeError)
        end
      end
    end

    context 'Mapped Value' do
      let(:data) do
        {
          'type' => 'mapped_value',
          'label' => 'Overall Aspiration Score',
          'source' => {
            'type' => 'formula',
            'formula' => {
              'op' => 'ADD',
              'args' => [{
                'type' => 'normed_factor',
                'factorId' => 1,
                'assessmentId' => user_result.assessment_id
              }, {
                'type' => 'normed_factor',
                'factorId' => 2,
                'assessmentId' => user_result.assessment_id
              }]
            }
          },
          'rules' => [
            {
              'conditions' => [
                { 'type' => 'greater_than_or_equal', 'value' => -6 },
                { 'type' => 'less_than', 'value' => -2 }
              ],
              'result' => 1
            },
            {
              'conditions' => [
                { 'type' => 'greater_than_or_equal', 'value' => -2 },
                { 'type' => 'less_than', 'value' => 2 }
              ],
              'result' => 2
            },
            {
              'conditions' => [
                { 'type' => 'greater_than_or_equal', 'value' => 2 },
                { 'type' => 'less_than_or_equal', 'value' => 6 }
              ],
              'result' => 3
            },
            {
              'conditions' => [
                { 'type' => 'greater_than_or_equal', 'value' => 6 }
              ],
              'result' => 4
            }
          ]
        }
      end
      subject { Reports::ResultTypes::MappedValue.call(build_results_command, data) }

      it do
        expect(::Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ factor_names: { 1 => 'Test factor1', 2 => 'Test factor2' } })
        is_expected.to eq(
          key: 'mapped_value',
          name: 'Overall Aspiration Score',
          value: 4,
          config_data: data
        )
      end
    end
  end
end
