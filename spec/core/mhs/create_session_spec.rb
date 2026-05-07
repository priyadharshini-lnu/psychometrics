# frozen_string_literal: true

require 'rails_helper'

describe Mhs::CreateSession do
  let!(:project) { create(:project) }
  let(:assessment) do
    create(:assessment, :mhs, project: project)
  end

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mhs_user_assessment) do
    create(:mhs_user_assessment, user_assessment: user_assessment)
  end

  let(:session_id) { SecureRandom.uuid }

  let!(:create_session_response) do
    {
      'createDate' => '2025-12-12T13:42:10.0883951Z',
      'createIPAddress' => '172.68.146.173',
      'description' => '',
      'details' => [
        {
          'code' => 200,
          'description' => 'Request JSON validated against schema.',
          'locationReference' => '001',
          'reference' => 'LA0120'
        },
        {
          'code' => 200,
          'description' => 'Session created successfully',
          'locationReference' => '021',
          'reference' => 'LA0120'
        }
      ],
      'eventNotifications' => {
        'dataGathererArchived' => false,
        'dataGathererComplete' => true,
        'dataGathererCreated' => false,
        'dataGathererResultsAvailable' => true,
        'dataGathererSetupComplete' => false,
        'dataGathererUpdated' => false,
        'dataGathererUpdateComplete' => false,
        'enrichmentArchived' => false,
        'enrichmentComplete' => true,
        'enrichmentInvoked' => false,
        'enrichmentResultsAvailable' => false,
        'evaluatorArchived' => false,
        'evaluatorComplete' => true,
        'evaluatorInvoked' => false,
        'evaluatorResultsAvailable' => false,
        'sessionArchived' => false,
        'sessionComplete' => false,
        'sessionCreated' => false,
        'sessionUpdateComplete' => false,
        'sessionUpdated' => false
      },
      'host' => {
        'computeProvider' => {},
        'invokeAsAsynchronous' => false,
        'storageProvider' => {}
      },
      'logs' => [
        {
          'code' => 200,
          'dateTime' => '2025-12-12T13:42:10.0883951Z',
          'resourceAction' => 'Create',
          'resourceType' => 'Session',
          'servicePrinciple' => 'CreateSession'
        }
      ],
      'measureID' => 'ad8f2591-4d23-4892-808e-5ea4e68feba7',
      'name' => '',
      'resources' => [],
      'retentionPolicy' => { 'type' => 'Default' },
      'runAs' => { 'identifier' => '', 'jobCode' => '' },
      'sessionID' => session_id
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: create_session_response.to_json) }

  subject { described_class.new(user_assessment) }

  before do
    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
    allow(response).to receive(:body).and_return(create_session_response.to_json)
    allow(response).to receive(:success?).and_return(true)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'creates a session successfully' do
        subject.call

        mhs_user_assessment.reload
        expect(mhs_user_assessment.session_id).to eq(session_id)
      end

      it 'broadcasts :ok with the result' do
        expect(subject).to receive(:broadcast).with(:ok, create_session_response)
        subject.call
      end

      it 'makes a POST request to the correct URL' do
        expect(client).to receive(:post) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)
          allow(req).to receive(:body=)

          expect(req).to receive(:url).with(subject.send(:session_url))
          expect(req).to receive(:body=).with(kind_of(String))

          block.call(req)
        end.and_return(response)

        subject.call
      end

      it 'sends the correct request body' do
        expected_body = {
          sessionGroupName: user_assessment.campaign.name,
          measureID: user_assessment.assessment.external_assessment_id,
          routingCode: 'Dev',
          retentionPolicy: {
            type: 'Default'
          },
          host: {
            computeProvider: {},
            storageProvider: {},
            invokeAsAsynchronous: false
          },
          eventNotifications: {
            dataGathererComplete: true,
            dataGathererResultsAvailable: true,
            enrichmentComplete: true,
            evaluatorComplete: true
          },
          runAs: {
            identifier: mhs_user_assessment.id.to_s
          }
        }

        expect(client).to receive(:post) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)

          expect(req).to receive(:body=).with(expected_body.to_json)

          block.call(req)
        end.and_return(response)

        subject.call
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
          project_id: project.id
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
          project_id: project.id
        })
        expect(subject).to receive(:broadcast).with(:error, 'Unexpected error')
        subject.call
      end
    end

    context 'when REAL_ENV is production' do
      before do
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:fetch).with('REAL_ENV', 'local').and_return('production')
      end

      it 'sends Prd as routingCode in request body' do
        body = JSON.parse(subject.send(:request_body).to_json)
        expect(body['routingCode']).to eq('Prd')
      end
    end
  end
end
