# frozen_string_literal: true

require 'rails_helper'

describe Mhs::CreateEvaluator do
  let!(:project) { create(:project) }
  let(:assessment) { create(:assessment, :mhs, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mhs_user_assessment) { create(:mhs_user_assessment, user_assessment: user_assessment) }

  let(:session_id) { 'test-session-id-1234-5678-9abc-def012345678' }
  let(:evaluator_id) { 'test-evaluator-id-abcd-efgh-ijkl-mnop12345678' }
  let(:measure_id) { 'test-measure-id-wxyz-0123-4567-890abcdef123' }
  let(:evaluation_id) { 'test-evaluation-id-qrst-uvwx-yzab-cdef01234567' }
  let(:demographics_source_id) { 'demo-source-id-1234' }

  let!(:mhs_response) do
    {
      'createDate' => '2025-12-18T11:15:48.2283956Z',
      'createIPAddress' => '172.68.146.172',
      'details' => [
        {
          'code' => 200,
          'description' => 'Evaluation created in session.',
          'locationReference' => '041',
          'reference' => 'LA0100'
        }
      ],
      'resources' => [
        {
          'evaluationID' => evaluation_id,
          'evaluatorID' => evaluator_id,
          'measureID' => measure_id,
          'outcomeItemSets' => [
            {
              'name' => 'TOTAL SCORE (TOT)',
              'outcomeSetID' => 'test-outcome-set-id-1234-5678-9abc',
              'outcomeItems' => '0|354|59|3|54|64',
              'observationItems' => '3|3|3|3|3|3',
              'thumbprint' => 'test-thumbprint'
            }
          ]
        }
      ]
    }
  end

  let(:observation_item_sets) do
    [
      {
        'sourceID' => 'b96fd1cd-00eb-4836-8a01-cad59cbfa8e3',
        'interpretAs' => 'bb4045b2-005e-4e5b-9c1d-dcc8543e61c6',
        'observationValues' => {
          'encodingSchema' => 'Encoded',
          'delimiter' => '|',
          'items' => '4|4|4|4|4|4'
        },
        'thumbprint' => 'b19afbadf2bf26471988ea0f6e4e2aa8',
        'isValid' => true
      },
      {
        'sourceID' => 'b96fd1cd-00eb-4836-8a01-cad59cbfa8e3',
        'interpretAs' => demographics_source_id,
        'observationValues' => {
          'encodingSchema' => 'Encoded',
          'delimiter' => '|',
          'items' => '31|0'
        },
        'thumbprint' => '85d5385adfd1830ad026030a6e2e46f0',
        'isValid' => true
      }
    ]
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: mhs_response.to_json) }

  subject { described_class.new(user_assessment) }

  before do
    allow(mhs_user_assessment).to receive(:session_id).and_return(session_id)
    allow(mhs_user_assessment).to receive(:observation_item_sets).and_return(observation_item_sets)
    allow(subject).to receive(:mhs_user_assessment).and_return(mhs_user_assessment)

    assessment_settings = double('assessment_settings')
    evaluator_settings = double('evaluator_settings', directives: [
      { key: 'NormRegion', value: '0' },
      { key: 'NormOption', value: 'General' },
      { key: 'ConfidenceInterval', value: '0' },
      { key: 'LeadershipBar', value: '1' }
    ])
    evaluators = [double('evaluator', id: evaluator_id)]
    observation_sets = [
      double('observation_set', name: 'Demographics (Scored)', source_id: demographics_source_id)
    ]

    allow(assessment_settings).to receive(:evaluators).and_return(evaluators)
    allow(assessment_settings).to receive(:evaluator).and_return(evaluator_settings)
    allow(assessment_settings).to receive(:observation_sets).and_return(observation_sets)
    allow(subject).to receive(:assessment_settings).and_return(assessment_settings)
    allow(subject).to receive(:measure_id).and_return(measure_id)
    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:put).and_return(response)
    allow(response).to receive(:body).and_return(mhs_response.to_json)
    allow(response).to receive(:success?).and_return(true)
  end

  describe '#call' do
    context 'when MHS API call succeeds' do
      it 'saves evaluation results to users_result' do
        subject.call

        users_result = user_assessment.reload.users_result
        expect(users_result.external_results['evaluation_id']).to eq(evaluation_id)
        expect(users_result.external_results['outcome_item_sets']).to be_present
      end

      it 'marks user assessment as completed' do
        subject.call

        expect(user_assessment.reload.status).to eq('completed')
        expect(user_assessment.completed_at).to be_present
      end

      it 'includes directives in the request body' do
        mhs_user_assessment.update!(norm_region: 0, norm_option: 0, confidence_interval: 0, leadership_bar: 1)

        expect(client).to receive(:put) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)
          expect(req).to receive(:body=) do |body|
            parsed_body = JSON.parse(body)
            evaluations = parsed_body['evaluations']
            expect(evaluations.first['directives']['keyValuePairsArray']).to include(
              { 'key' => 'NormRegion', 'value' => '0' },
              { 'key' => 'NormOption', 'value' => '0' }
            )
          end
          block.call(req)
        end.and_return(response)

        subject.call
      end
    end

    context 'when MHS API call fails' do
      let(:error_response) { { 'error' => 'Invalid session' } }

      before do
        allow(response).to receive(:success?).and_return(false)
        allow(response).to receive(:body).and_return(error_response.to_json)
      end

      it 'handles failure appropriately' do
        expect { subject.send(:handle_failure, error_response) }.to raise_error(Mhs::Exceptions::CreateEvaluatorFailed)
      end
    end

    context 'when an exception occurs' do
      before do
        allow(client).to receive(:put).and_raise(StandardError.new('Network error'))
      end

      it 'captures exception with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(
          an_instance_of(StandardError),
          extra: hash_including(
            user_assessment_id: user_assessment.id
          )
        )

        subject.call
      end

      it 'broadcasts error message' do
        expect(subject).to receive(:broadcast).with(:error, 'Network error')
        subject.call
      end
    end
  end

  describe 'private methods' do
    describe '#demographics_incomplete?' do
      context 'when demographics observation set is missing' do
        before do
          allow(mhs_user_assessment).to receive(:observation_item_sets).and_return([])
        end

        it 'returns true' do
          expect(subject.send(:demographics_incomplete?)).to be true
        end
      end

      context 'when demographic data has missing values' do
        before do
          incomplete_observation_sets = [
            {
              'interpretAs' => demographics_source_id,
              'observationValues' => { 'items' => '-99|F' }
            }
          ]
          allow(mhs_user_assessment).to receive(:observation_item_sets).and_return(incomplete_observation_sets)
        end

        it 'returns true' do
          expect(subject.send(:demographics_incomplete?)).to be true
        end
      end

      context 'when demographic data is complete' do
        it 'returns false' do
          expect(subject.send(:demographics_incomplete?)).to be false
        end
      end
    end

    describe '#demographics_observation_set' do
      it 'finds the correct observation set by interpretAs' do
        result = subject.send(:demographics_observation_set)
        expect(result).to_not be_nil
        expect(result['interpretAs']).to eq(demographics_source_id)
      end
    end

    describe '#extract_demographic_data' do
      it 'extracts age and gender from positions 0 and 1' do
        result = subject.send(:extract_demographic_data)
        expect(result[:age]).to eq('31')
        expect(result[:gender]).to eq('0')
      end

      context 'when observation set is missing' do
        before do
          allow(subject).to receive(:demographics_observation_set).and_return(nil)
        end

        it 'returns empty hash' do
          expect(subject.send(:extract_demographic_data)).to eq({})
        end
      end
    end

    describe '#missing_demographic_values?' do
      it 'returns true for missing value indicator' do
        demographic_data = { age: '-99', gender: 'M' }
        expect(subject.send(:missing_demographic_values?, demographic_data)).to be true
      end

      it 'returns true for blank values' do
        demographic_data = { age: '25', gender: '' }
        expect(subject.send(:missing_demographic_values?, demographic_data)).to be true
      end

      it 'returns false for complete values' do
        demographic_data = { age: '25', gender: 'M' }
        expect(subject.send(:missing_demographic_values?, demographic_data)).to be false
      end
    end

    describe '#adjust_norm_directive' do
      let(:general_directive) { { key: 'NormOption', value: 'General' } }
      let(:professional_directive) { { key: 'NormOption', value: 'Professional' } }

      it 'adjusts General norm to value 1' do
        result = subject.send(:adjust_norm_directive, general_directive)
        expect(result[:value]).to eq('1')
      end

      it 'adjusts Professional norm to value 3' do
        result = subject.send(:adjust_norm_directive, professional_directive)
        expect(result[:value]).to eq('3')
      end

      it 'converts Config::Options to hash' do
        config_directive = double('Config::Options',
                                  '[]': 'NormOption',
                                  value: 'General',
                                  to_h: { key: 'NormOption', value: 'General' })

        result = subject.send(:adjust_norm_directive, config_directive)
        expect(result).to be_a(Hash)
        expect(result[:value]).to eq('1')
      end
    end

    describe '#evaluator_directives' do
      before do
        mhs_user_assessment.update!(
          norm_region: 1,
          norm_option: 2,
          confidence_interval: 0,
          leadership_bar: 1
        )
      end

      it 'uses values from mhs_user_assessment' do
        directives = subject.send(:evaluator_directives)

        expect(directives).to include(
          { key: 'NormRegion', value: '1' },
          { key: 'NormOption', value: '2' },
          { key: 'ConfidenceInterval', value: '0' },
          { key: 'LeadershipBar', value: '1' }
        )
      end

      context 'when demographics are incomplete' do
        before do
          incomplete_observation_sets = [
            {
              'interpretAs' => demographics_source_id,
              'observationValues' => { 'items' => '-99|F' }
            }
          ]
          allow(mhs_user_assessment).to receive(:observation_item_sets).and_return(incomplete_observation_sets)
        end

        it 'adjusts NormOption directive' do
          directives = subject.send(:evaluator_directives)
          norm_directive = directives.find { |d| d[:key] == 'NormOption' }
          expect(norm_directive[:value]).to eq('1')
        end
      end

      context 'when demographics are complete' do
        it 'keeps original NormOption directive unchanged' do
          directives = subject.send(:evaluator_directives)
          norm_directive = directives.find { |d| d[:key] == 'NormOption' }
          expect(norm_directive[:value]).to eq('2')
        end
      end
    end

    describe '#request_body' do
      it 'includes all required fields' do
        body = subject.send(:request_body)

        expect(body[:evaluations]).to be_an(Array)
        expect(body[:evaluations].first).to include(
          resourceType: 'Evaluation',
          evaluatorID: evaluator_id,
          measureID: measure_id,
          directives: hash_including(keyValuePairsArray: an_instance_of(Array))
        )
        expect(body[:evaluations].first[:observationItemSets]).to eq(observation_item_sets)
        expect(body).to include(:retentionPolicy, :host, :eventNotifications, :runAs)
      end
    end

    describe '#save_evaluation_results' do
      let(:users_result) { user_assessment.users_result }

      it 'saves external results data' do
        subject.send(:save_evaluation_results, mhs_response)

        expect(users_result.reload.external_results).to include(
          'evaluation_id' => evaluation_id,
          'evaluator_id' => evaluator_id,
          'measure_id' => measure_id,
          'outcome_item_sets' => mhs_response['resources'].first['outcomeItemSets'],
          'source' => 'mhs_evaluator'
        )
      end

      it 'updates user assessment status to completed' do
        subject.send(:save_evaluation_results, mhs_response)

        expect(user_assessment.reload).to be_completed
        expect(user_assessment.completed_at).to be_present
      end

      context 'when user assessment is already completed' do
        before do
          user_assessment.update!(status: :completed, completed_at: 1.hour.ago)
        end

        it 'does not update completed_at' do
          original_completed_at = user_assessment.completed_at
          subject.send(:save_evaluation_results, mhs_response)

          expect(user_assessment.reload.completed_at).to eq(original_completed_at)
        end
      end
    end
  end
end
