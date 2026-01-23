# frozen_string_literal: true

require 'rails_helper'

describe Mhs::GetDataGathering do
  let!(:project) { create(:project) }
  let(:assessment) { create(:assessment, :mhs, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let(:session_id) { 'test-session-id-1234-5678-9abc-def012345678' }
  let(:data_gatherer_id) { 'test-gatherer-id-abcd-efgh-ijkl-mnop12345678' }
  let(:data_gathering_id) { 'test-gathering-id-wxyz-0123-4567-890abcdef123' }
  let(:measure_id) { 'test-measure-id-1234-5678-9abc-def012345678' }

  let!(:mhs_user_assessment) do
    create(:mhs_user_assessment,
           user_assessment: user_assessment,
           session_id: session_id,
           data_gatherer_id: data_gatherer_id,
           data_gathering_id: data_gathering_id)
  end

  let(:data_gathering_response) do
    {
      'checkpointID' => 'end',
      'dataGathererDescription' => 'Test Assessment',
      'dataGathererID' => data_gatherer_id,
      'dataGatheringID' => data_gathering_id,
      'directives' => {
        'keyValuePairsArray' => [
          {
            'key' => 'string',
            'value' => 'string'
          }
        ]
      },
      'eventNotifications' => {},
      'observationItemSets' => [
        {
          'sourceID' => 'test-source-id-1234-5678-9abc-def012345678',
          'interpretAs' => 'test-demographics-form-id-1234-5678-9abc',
          'observationValues' => {
            'encodingSchema' => 'Encoded',
            'delimiter' => '|',
            'items' => 'TestUser|TestLast||25|42|'
          },
          'thumbprint' => 'test1234567890abcdef1234567890ab',
          'isValid' => true
        },
        {
          'sourceID' => 'test-source-id-1234-5678-9abc-def012345678',
          'interpretAs' => 'test-assessment-form-id-1234-5678-9abc',
          'observationValues' => {
            'encodingSchema' => 'Encoded',
            'delimiter' => '|',
            'items' => '2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2|2'
          },
          'thumbprint' => 'testassess1234567890abcdef123456',
          'isValid' => true
        }
      ],
      'retentionPolicy' => {
        'type' => 'Default'
      },
      'resourceState' => 'Complete',
      'resourceType' => 'DataGathering',
      'runAs' => {
        'identifier' => 'test-user-12345'
      }
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: data_gathering_response.to_json) }

  subject { described_class.new(user_assessment) }

  before do
    allow(assessment).to receive(:external_assessment_id).and_return(measure_id)

    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:get).and_return(response)
    allow(response).to receive(:body).and_return(data_gathering_response.to_json)
    allow(response).to receive(:success?).and_return(true)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'broadcasts :ok with the result' do
        expect(subject).to receive(:broadcast).with(:ok, data_gathering_response)
        subject.call
      end

      it 'makes a GET request to the correct URL' do
        expected_url = "#{subject.send(:api_base_url)}/sessions/#{session_id}/dataGatherers/#{data_gatherer_id}/instances/#{data_gathering_id}" # rubocop:disable Layout/LineLength

        expect(client).to receive(:get) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)
          allow(req).to receive(:params=)

          expect(req).to receive(:url).with(expected_url)
          expect(req).to receive(:params=).with({
            measureID: measure_id,
            format: 'JSON'
          })

          block.call(req)
        end.and_return(response)

        subject.call
      end

      it 'includes correct query parameters' do
        expect(client).to receive(:get) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)

          expect(req).to receive(:params=) do |params|
            expect(params[:measureID]).to eq(measure_id)
            expect(params[:format]).to eq('JSON')
          end

          block.call(req)
        end.and_return(response)

        subject.call
      end

      it 'returns data gathering with observation item sets' do
        result = nil
        expect(subject).to receive(:broadcast).with(:ok, anything) do |_status, data|
          result = data
        end

        subject.call

        expect(result['observationItemSets']).to be_an(Array)
        expect(result['observationItemSets'].length).to eq(2)
        expect(result['resourceState']).to eq('Complete')
        expect(result['resourceType']).to eq('DataGathering')
      end

      it 'saves observation item sets to mhs_user_assessment' do
        subject.call

        mhs_user_assessment.reload
        expect(mhs_user_assessment.observation_item_sets).to be_present
        expect(mhs_user_assessment.observation_item_sets).to be_an(Array)
        expect(mhs_user_assessment.observation_item_sets.length).to eq(2)
        expect(mhs_user_assessment.observation_item_sets.first['sourceID']).
          to eq('test-source-id-1234-5678-9abc-def012345678')
      end

      context 'when response has no observation item sets' do
        let(:data_gathering_response_without_observations) do
          data_gathering_response.except('observationItemSets')
        end

        before do
          allow(response).to receive(:body).and_return(data_gathering_response_without_observations.to_json)
        end

        it 'does not update observation_item_sets field' do
          original_observation_sets = mhs_user_assessment.observation_item_sets

          subject.call

          mhs_user_assessment.reload
          expect(mhs_user_assessment.observation_item_sets).to eq(original_observation_sets)
        end
      end
    end

    context 'when there is a Faraday error' do
      let(:error) { Faraday::Error.new('Connection failed') }

      before do
        allow(client).to receive(:get).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures the exception with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, extra: {
          user_assessment_id: user_assessment.id,
          mhs_user_assessment_id: mhs_user_assessment.id,
          session_id: session_id,
          data_gatherer_id: data_gatherer_id,
          data_gathering_id: data_gathering_id
        })
        subject.call
      end

      it 'broadcasts :error with the error message' do
        expect(subject).to receive(:broadcast).with(:error, 'Connection failed')
        subject.call
      end
    end

    context 'when mhs_user_assessment has missing data' do
      let(:incomplete_user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
      let!(:incomplete_mhs_user_assessment) do
        create(:mhs_user_assessment,
               user_assessment: incomplete_user_assessment,
               session_id: nil,
               data_gatherer_id: nil,
               data_gathering_id: nil)
      end

      subject { described_class.new(incomplete_user_assessment) }

      it 'handles missing IDs gracefully' do
        # The service should still attempt the request even with nil values
        # This allows for better error messages from the API
        expect(client).to receive(:get).and_return(response)
        subject.call
      end
    end
  end

  describe 'private methods' do
    describe '#data_gathering_url' do
      it 'constructs the correct URL from mhs_user_assessment data' do
        expected_url = "#{subject.send(:api_base_url)}/sessions/#{session_id}/dataGatherers/#{data_gatherer_id}/instances/#{data_gathering_id}" # rubocop:disable Layout/LineLength
        expect(subject.send(:data_gathering_url)).to eq(expected_url)
      end
    end

    describe '#url_params' do
      it 'returns correct query parameters' do
        params = subject.send(:url_params)
        expect(params[:measureID]).to eq(measure_id)
        expect(params[:format]).to eq('JSON')
      end
    end
  end
end
