# frozen_string_literal: true

require 'rails_helper'

describe Mhs::CreateDataGatherer do
  let!(:project) { create(:project) }
  let(:assessment) do
    create(:assessment, :mhs, project: project)
  end

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mhs_user_assessment) do
    create(:mhs_user_assessment, user_assessment: user_assessment)
  end

  let(:session_id) { 'test-session-id-1234-5678-9abc-def012345678' }
  let(:data_gatherer_id) { 'test-gatherer-id-abcd-efgh-ijkl-mnop12345678' }
  let(:data_gathering_id) { 'test-gathering-id-wxyz-0123-4567-890abcdef123' }

  let!(:create_data_gatherer_response) do
    {
      'createDate' => '2025-12-15T06:24:58.1119265Z',
      'createIPAddress' => '172.68.146.172',
      'details' => [
        {
          'code' => 200,
          'description' => 'Request JSON validated against schema.',
          'locationReference' => '001',
          'reference' => 'LA0130'
        },
        {
          'code' => 200,
          'description' => 'Test session found successfully.',
          'locationReference' => '018',
          'reference' => 'LA0130'
        },
        {
          'code' => 200,
          'description' => 'Data Gathering session setup complete.',
          'locationReference' => '021',
          'reference' => 'LA0130'
        }
      ],
      'eventNotifications' => {},
      'host' => {
        'computeProvider' => {},
        'storageProvider' => {}
      },
      'resources' => [
        {
          'dataGathererID' => data_gatherer_id,
          'dataGatheringID' => data_gathering_id,
          'description' => 'Janus Data Gatherer',
          'links' => [
            {
              'format' => 'HTML',
              'href' => "https://dg.mhs.com?sessionID=#{session_id}&dataGathererID=#{data_gatherer_id}&dataGatheringID=#{data_gathering_id}&measureID=test-measure-id-1234-5678-9abc-def012345678&tenantID=test-tenant-id-1234-5678-9abc-def012345678",
              'rel' => 'DataGatherer',
              'type' => 'GET'
            },
            {
              'format' => 'JSON',
              'href' => "https://services.mhs.com/Janus/2022-10/sessions/#{session_id}/dataGatherers/#{data_gatherer_id}/instances/#{data_gathering_id}?measureID=test-measure-id-1234-5678-9abc-def012345678&format=JSON",
              'rel' => 'DataGatherer',
              'type' => 'GET'
            }
          ],
          'measureID' => 'test-measure-id-1234-5678-9abc-def012345678',
          'resourceID' => data_gathering_id,
          'resourceType' => 'DataGathering'
        }
      ],
      'retentionPolicy' => {
        'type' => 'Default'
      },
      'runAs' => {
        'identifier' => '',
        'jobCode' => ''
      },
      'sessionID' => session_id
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: create_data_gatherer_response.to_json) }

  subject { described_class.new(session_id, user_assessment) }

  before do
    # Mock the assessment settings
    assessment_settings = double('assessment_settings')
    data_gatherer_settings = double('data_gatherer_settings', directives: [
      { key: 'Language', value: 'en-US' }
    ])
    data_gatherers = [double('data_gatherer', id: data_gatherer_id)]
    observation_sets = [
      double('observation_set', name: 'Demographics (Unscored)', source_id: 'test-demographics-form-id-1234-5678-9abc')
    ]
    allow(assessment_settings).to receive(:data_gatherers).and_return(data_gatherers)
    allow(assessment_settings).to receive(:observation_sets).and_return(observation_sets)
    allow(assessment_settings).to receive(:data_gatherer).and_return(data_gatherer_settings)
    allow(subject).to receive(:assessment_settings).and_return(assessment_settings)

    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
    allow(response).to receive(:body).and_return(create_data_gatherer_response.to_json)
    allow(response).to receive(:success?).and_return(true)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'creates a data gatherer successfully' do
        subject.call

        mhs_user_assessment.reload
        expect(mhs_user_assessment.data_gatherer_id).to eq(data_gatherer_id)
        expect(mhs_user_assessment.data_gathering_id).to eq(data_gathering_id)
        expect(mhs_user_assessment.url).to include('https://dg.mhs.com')
      end

      it 'broadcasts :ok with the result' do
        expect(subject).to receive(:broadcast).with(:ok, create_data_gatherer_response)
        subject.call
      end

      it 'makes a POST request to the correct URL' do
        expected_url = "#{subject.send(:api_base_url)}/sessions/#{session_id}/dataGatherers"

        expect(client).to receive(:post) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)
          allow(req).to receive(:body=)

          expect(req).to receive(:url).with(expected_url)
          expect(req).to receive(:body=).with(kind_of(String))

          block.call(req)
        end.and_return(response)

        subject.call
      end

      it 'sends the correct request body structure' do
        expect(client).to receive(:post) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)

          expect(req).to receive(:body=) do |body|
            parsed_body = JSON.parse(body)
            expect(parsed_body['dataGatherings']).to be_an(Array)
            expect(parsed_body['dataGatherings'].first['resourceType']).to eq('DataGathering')
            expect(parsed_body['dataGatherings'].first['dataGathererID']).to be_present
            expect(parsed_body['dataGatherings'].first['observationItemSets']).to be_an(Array)
            expect(parsed_body['retentionPolicy']['type']).to eq('Default')
            expect(parsed_body['host']).to have_key('computeProvider')
            expect(parsed_body['host']).to have_key('storageProvider')
            expect(parsed_body['eventNotifications']).to be_a(Hash)
            expect(parsed_body['runAs']).to have_key('identifier')
          end

          block.call(req)
        end.and_return(response)

        subject.call
      end
    end

    describe 'masking functionality' do
      let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }

      before do
        user_assessment.update!(subject: user)
      end

      it 'uses masked identity when enabled' do
        allow(user_assessment.project).to receive(:mask_identity_for_mhs?).and_return(true)

        masked_identity = subject.send(:maskable_identity)
        expect(masked_identity.first_name).to eq(user.id.to_s)
        expect(masked_identity.last_name).to eq(user.id.to_s)
      end

      it 'uses real identity when disabled' do
        allow(user_assessment.project).to receive(:mask_identity_for_mhs?).and_return(false)

        masked_identity = subject.send(:maskable_identity)
        expect(masked_identity.first_name).to eq('John')
        expect(masked_identity.last_name).to eq('Doe')
      end
    end

    context 'when there is a Faraday error' do
      let(:error) { Faraday::Error.new('Connection failed') }

      before do
        allow(client).to receive(:post).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures the exception with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, extra: {
          user_assessment_id: user_assessment.id,
          project_id: project.id,
          session_id: session_id
        })
        subject.call
      end

      it 'broadcasts :error with the error message' do
        expect(subject).to receive(:broadcast).with(:error, 'Connection failed')
        subject.call
      end
    end

    context 'when there is a standard error' do
      let(:error) { StandardError.new('Unexpected error') }

      before do
        allow(client).to receive(:post).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures the exception with Sentry and broadcasts error' do
        expect(Sentry).to receive(:capture_exception).with(error, extra: {
          user_assessment_id: user_assessment.id,
          project_id: project.id,
          session_id: session_id
        })
        expect(subject).to receive(:broadcast).with(:error, 'Unexpected error')
        subject.call
      end
    end
  end
end
