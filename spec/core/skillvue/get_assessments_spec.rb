# frozen_string_literal: true

require 'rails_helper'

describe Skillvue::GetAssessments do
  let(:project) { create(:project) }
  let(:config) { { 'api_key' => 'test-api-key' } }
  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: successful_response) }

  let(:successful_response) do
    {
      success: true,
      error: nil,
      data: {
        counters: {
          total: 1,
          pages: {
            current: 1,
            total: 1
          }
        },
        assessments: [
          {
            alias: '36d0676c454f67d39e67aee0699a2edd',
            name: 'MTE Test',
            expiration: nil,
            iso_code: 'en'
          }
        ]
      }
    }.to_json
  end

  let(:failed_response) do
    {
      success: false,
      error: 'API key is invalid',
      data: nil
    }.to_json
  end

  subject { described_class.new(project) }

  before do
    allow(project).to receive(:skillvue_config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when config is not present' do
      before do
        allow(project).to receive(:skillvue_config).and_return(nil)
      end

      it 'broadcasts :ok with an empty array' do
        expect(subject).to receive(:broadcast).with(:ok, [])
        subject.call
      end
    end

    context 'when config is present' do
      context 'and the API call is successful' do
        before do
          allow(client).to receive(:get).and_return(response)
        end

        it 'makes a request to the correct endpoint' do
          expect(client).to receive(:get).with("#{Settings.skillvue.base_api_url}/v1/assessments")
          subject.call
        end

        it 'correctly parses the successful response' do
          expect(subject).to receive(:broadcast).with(:ok, [
            {
              'alias' => '36d0676c454f67d39e67aee0699a2edd',
              'name' => 'MTE Test',
              'expiration' => nil,
              'iso_code' => 'en'
            }
          ])
          subject.call
        end
      end

      context 'when API returns an error response' do
        before do
          allow(response).to receive(:body).and_return(failed_response)
          allow(client).to receive(:get).and_return(response)
          allow(Sentry).to receive(:capture_message)
        end

        it 'logs the error and broadcasts an empty array' do
          expect(Sentry).to receive(:capture_message).with(
            'Skillvue API error: API key is invalid',
            extra: { project_id: project.id, response: JSON.parse(failed_response) }
          )
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end

      context 'when a Faraday error occurs' do
        before do
          allow(client).to receive(:get).and_raise(Faraday::Error.new('Connection failed'))
          allow(Sentry).to receive(:capture_exception)
        end

        it 'captures the exception and broadcasts an empty array' do
          expect(Sentry).to receive(:capture_exception).with(
            instance_of(Faraday::Error),
            extra: { project_id: project.id }
          )
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end

      context 'when a JSON parsing error occurs' do
        before do
          allow(response).to receive(:body).and_return('invalid json')
          allow(client).to receive(:get).and_return(response)
          allow(Sentry).to receive(:capture_exception)
        end

        it 'captures the exception and broadcasts an empty array' do
          expect(Sentry).to receive(:capture_exception).with(
            instance_of(JSON::ParserError),
            hash_including(extra: hash_including(project_id: project.id))
          )
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end
    end
  end
end
