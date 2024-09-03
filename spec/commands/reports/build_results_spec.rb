# frozen_string_literal: true

require 'rails_helper'

describe Reports::BuildResults do
  context '.call' do
    let(:report)           { double('report', data_configuration: data_configuration, id: 1) }
    let(:user)             { create(:user, first_name: 'Jon', last_name: 'Snow') }
    let(:scoring) do
      {
        '1' => { 'results' => [1, 2, 3], 'norm_score' => 3, 'zscore' => 1.68817 },
        '2' => { 'results' => [4, 5, 6], 'norm_score' => 5.5, 'zscore' => 3.67817 }
      }
    end
    let(:user_result) do
      create(:users_result,
             subject: user,
             external_results: external_results,
             scoring: scoring)
    end
    let(:campaign) { user_result.campaign }
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

    context 'SavilleResults' do
      let(:user_result) do
        create(:users_result,
               subject: user,
               external_results: {
                 'scores' => [
                   { 'id' => 'WAVEFS_RATACQ', 'score_type' => 'Normative', 'value_type' => 'sten', 'score' => 2 },
                   { 'id' => 'WAVEFS_RATACQ', 'score_type' => 'Normative', 'value_type' => 'z', 'score' => 3 },
                   { 'id' => 'WAVEFS_CONRANK', 'score_type' => 'Normative', 'value_type' => 'z', 'score' => 4 }
                 ]
               })
      end
      let(:build_result_command) { described_class.new(report, [user_result]) }

      it 'matches factorId, score_type, value_type and return valid score' do
        data = {
          'type' => 'saville_result',
          'factorId' => 'WAVEFS_RATACQ',
          'scoreType' => 'Normative',
          'valueType' => 'z',
          'assessmentId' => user_result.assessment_id,
          'label' => 'Factor'
        }
        result = Reports::ResultTypes::SavilleResults.call(build_result_command, data)

        expect(result).to eq({
          key: "#{data['factorId']}.#{data['scoreType']}.#{data['valueType']}",
          name: data['label'],
          config_data: data,
          value: 3
        })
      end

      it 'returns nil as value if no score for a factor is present' do
        data = {
          'type' => 'saville_result',
          'factorId' => 'WAVEFS_RATACQ',
          'scoreType' => 'Ipsative',
          'valueType' => 'z',
          'assessmentId' => user_result.assessment_id,
          'label' => 'Factor'
        }
        result = Reports::ResultTypes::SavilleResults.call(build_results_command, data)

        expect(result).to eq({
          key: "#{data['factorId']}.#{data['scoreType']}.#{data['valueType']}",
          name: data['label'],
          config_data: data,
          value: nil
        })
      end
    end

    context 'sheet' do
      let(:data) do
        {
          'id' => 'Performance_Rating',
          'type' => 'sheet',
          'key' => 'Performance Rating',
          'category' => 'computed_scores'
        }
      end
      let(:sheet) do
        create(:sheet, campaign: user_result.campaign)
      end
      let!(:sheet_row) do
        create(:sheet_row, sheet: sheet, email: user_result.subject.email,
                data: { 'Performance Rating' => 2.5 })
      end

      it 'should return sheet column value' do
        result = Reports::ResultTypes::Datasheet.call(build_results_command, data)
        expect(result).to eq(key: 'Performance_Rating', name: 'Performance Rating',
                             value: 2.5, config_data: data)
      end
      it 'should return nil for sheet column' do
        user_result = create(:users_result)
        build_results_command = described_class.new(report, [user_result])
        result = Reports::ResultTypes::Datasheet.call(build_results_command, data)
        expect(result).to eq(key: 'Performance_Rating', name: 'Performance Rating',
                             value: nil, config_data: data)
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

    context 'RankedOccupations' do
      it 'returns nil as key, value and name if user_result for the assessment is missing' do
        data = { 'assessmentId' => user_result.assessment_id + 1, 'position' => 1 }
        result = Reports::ResultTypes::RankedOccupations.call(build_results_command, data)

        expect(result).to eq(key: nil, name: nil, config_data: data, value: nil)
      end

      it 'returns nil as key and value if user_result for the assessment is missing' do
        occupation = create(:occupation)
        user_result.update(occupations: [{ value: 'first', id: 2 }, { value: 'second', id: occupation.id }])
        data = { 'assessmentId' => user_result.assessment_id, 'position' => 2 }
        result = Reports::ResultTypes::RankedOccupations.call(build_results_command, data)

        expect(result).to eq(
          key: occupation.id, name: occupation.decorate.display_name, config_data: data, value: 'second'
        )
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

    context 'CampaignFactor' do
      before(:each) do
        allow(::Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ campaign_factor_codes: ['cognitive_score'] })
      end

      let(:data) do
        { 'code' => 'cognitive_score', 'id' => 'COGNITIVE_SCORE', 'label' => 'Overall Cognitive Percentile' }
      end

      subject { Reports::ResultTypes::CampaignFactor.call(build_results_command, data) }

      it 'gets campaign factor score is scores are present' do
        campaign_factor = create(:campaign_factor, campaign: campaign, code: 'cognitive_score')
        create(:campaign_factor_value, user: user, campaign: campaign, campaign_factor: campaign_factor,
          numeric_value: 3)
        is_expected.to eq(key: 'COGNITIVE_SCORE', name: 'Overall Cognitive Percentile', value: 3, config_data: data)
      end

      it 'returns nil if campaign_factor_value is not present' do
        create(:campaign_factor, campaign: campaign, code: 'cognitive_score')
        is_expected.to eq(key: 'COGNITIVE_SCORE', name: 'Overall Cognitive Percentile', value: nil, config_data: data)
      end

      it 'returns nil if campaign_factor is not present' do
        is_expected.to eq(key: 'COGNITIVE_SCORE', name: 'Overall Cognitive Percentile', value: nil, config_data: data)
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
          normed_factor_arg = { 'type' => 'normed_factor' }
          allow(data).to receive(:dig).with('formula', 'args').and_return(Array.new(3, normed_factor_arg))
          allow(Reports::ResultTypes::NormedFactor).to receive(:call).and_return(
            { value: 1 }, { value: 2 }, { value: 3 }
          )
          allow(data).to receive(:dig).with('formula', 'round').and_return(nil)
        end

        it 'AVERAGE' do
          allow(data).to receive(:dig).with('formula', 'op').and_return('AVERAGE')
          is_expected.to eq(key: 'formula', name: nil, value: 2.0, config_data: data)
        end

        it 'AVERAGE with round' do
          allow(Reports::ResultTypes::NormedFactor).to receive(:call).and_return(
            { value: 1 }, { value: 2 }, { value: 4 }
          )
          allow(data).to receive(:dig).with('formula', 'op').and_return('AVERAGE')
          allow(data).to receive(:dig).with('formula', 'round').and_return(5)
          is_expected.to eq(key: 'formula', name: nil, value: 2.33333, config_data: data)
        end

        it 'AVERAGE with float' do
          data = {
            'type' => 'formula',
            'formula' => {
              'op' => 'AVERAGE',
              'args' => [
                {
                  'type' => 'normed_factor',
                  'factorId' => 1,
                  'assessmentId' => user_result.assessment_id
                },
                {
                  'type' => 'float',
                  'value' => 2
                }
              ]
            }
          }
          data_configuration = {
            sections: [
              {
                data: [data]
              }
            ]
          }

          allow(Reports::ResultTypes::NormedFactor).to receive(:call).and_return(
            { value: 3 }
          )

          report = create(:report, data_configuration: data_configuration)

          res = described_class.call!(report, [user_result])

          expect(res[0]).to eq(key: 'formula', name: nil, value: 2.5, config_data: data)
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
          'id' => 'overall_aspiration_score',
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
          key: 'overall_aspiration_score',
          name: 'Overall Aspiration Score',
          value: 4,
          config_data: data
        )
      end
    end

    context 'Ref' do
      let(:data_configuration) do
        {
          refs: [
            {
              ref_id: 'factor_x',
              type: 'normed_factor',
              assessmentId: user_result.assessment.id,
              factorId: 1
            }
          ],
          sections: [
            {
              data: [
                {
                  type: 'ref',
                  ref: 'factor_x'
                }
              ]
            }
          ]
        }
      end

      let(:report) { create(:report, data_configuration: data_configuration) }
      before(:each) do
        allow(::Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ factor_names: { 1 => 'Test factor1' } })
      end

      subject { described_class.call!(report, [user_result]) }

      it 'resolves to the ref' do
        is_expected.to eq([
          {
            config_data: {
              'assessmentId' => user_result.assessment.id,
              'factorId' => 1,
              'ref_id' => 'factor_x',
              'type' => 'normed_factor'
            },
            key: 1,
            name: 'Test factor1',
            value: 3
          }
        ])
      end
    end

    context 'Zscore Factor' do
      let(:data_configuration) do
        {
          sections: [
            {
              data: [
                {
                  type: 'zscore_factor',
                  factorId: 1,
                  assessmentId: user_result.assessment.id
                },
                {
                  type: 'zscore_factor',
                  factorId: 2,
                  assessmentId: user_result.assessment.id
                }
              ]
            }
          ]
        }
      end
      let(:report) { create(:report, data_configuration: data_configuration) }

      subject { described_class.call!(report, [user_result]) }

      it 'resolves to the zscore' do
        allow(::Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ factor_names: { 1 => 'Test factor1', 2 => 'Test factor2' } })

        is_expected.to eq([
          {
            config_data: {
              'assessmentId' => user_result.assessment.id,
              'factorId' => 1,
              'type' => 'zscore_factor'
            },
            key: 1,
            name: 'Test factor1',
            value: 1.68817
          },
          {
            config_data: {
              'assessmentId' => user_result.assessment.id,
              'factorId' => 2,
              'type' => 'zscore_factor'
            },
            key: 2,
            name: 'Test factor2',
            value: 3.67817
          }
        ])
      end
    end

    context 'Zscore to Percentile' do
      let(:data_configuration) do
        {
          sections: [
            {
              data: [
                {
                  type: 'zscore_to_percentile',
                  label: 'Overall Score',
                  source: {
                    type: 'zscore_factor',
                    factorId: 1,
                    assessmentId: user_result.assessment.id
                  },
                  round: 1
                }
              ]
            }
          ]
        }
      end
      let(:report) { create(:report, data_configuration: data_configuration) }

      subject { described_class.call!(report, [user_result]) }

      it 'resolves zscore to percentile' do
        allow(::Reports::GetDataConfigurationResources).to receive(:call!).
          and_return({ factor_names: { 1 => 'Test factor1' } })

        is_expected.to eq([
          {
            config_data: {
              'label' => 'Overall Score',
              'source' => {
                'assessmentId' => user_result.assessment.id,
                'factorId' => 1,
                'type' => 'zscore_factor'
              },
              'round' => 1,
              'type' => 'zscore_to_percentile'
            },
            key: nil,
            name: 'Overall Score',
            value: 95.4
          }
        ])
      end
    end
  end
end
