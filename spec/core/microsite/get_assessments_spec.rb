# frozen_string_literal: true

require 'rails_helper'

describe Microsite::GetAssessments do
  let(:project) { create(:project) }
  let(:config) { { 'api_key' => 'test-api-key' } }
  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: successful_response) }

  let(:successful_response) do
    {
      'success' => true,
      'data' => {
        'assessments' => [
          {
            'assessmentId' => 'ms-assessment-001',
            'name' => 'Communication Skills',
            'questions' => { 'q1' => { 'kind' => 'single_choice', 'prompts' => ['Question 1?'] } }
          },
          {
            'assessmentId' => 'ms-assessment-002',
            'name' => 'Leadership Assessment',
            'questions' => { 'q2' => { 'kind' => 'single_choice', 'prompts' => ['Question 2?'] } }
          }
        ]
      }
    }
  end

  let(:empty_response) do
    { 'success' => true, 'data' => { 'assessments' => [] } }
  end

  subject { described_class.new(project) }

  before do
    allow(project).to receive(:microsite_config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when config is not present' do
      before do
        allow(project).to receive(:microsite_config).and_return(nil)
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
          expect(client).to receive(:get).with("#{Settings.microsite.base_api_url}/api/v1/assessments")
          subject.call
        end

        it 'correctly parses the successful response' do
          expect(subject).to receive(:broadcast).with(:ok, [
            {
              'assessmentId' => 'ms-assessment-001',
              'name' => 'Communication Skills',
              'questions' => { 'q1' => { 'kind' => 'single_choice', 'prompts' => ['Question 1?'] } }
            },
            {
              'assessmentId' => 'ms-assessment-002',
              'name' => 'Leadership Assessment',
              'questions' => { 'q2' => { 'kind' => 'single_choice', 'prompts' => ['Question 2?'] } }
            }
          ])
          subject.call
        end
      end

      context 'when API returns an empty response' do
        before do
          allow(response).to receive(:body).and_return(empty_response)
          allow(client).to receive(:get).and_return(response)
        end

        it 'broadcasts an empty array' do
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end

      context 'when a Faraday error occurs' do
        before do
          allow(client).to receive(:get).and_raise(Faraday::ConnectionFailed.new('Connection failed'))
          allow(Sentry).to receive(:capture_exception)
        end

        it 'captures the error and broadcasts an empty array' do
          expect(Sentry).to receive(:capture_exception).with(
            kind_of(Faraday::ConnectionFailed),
            extra: { project_id: project.id }
          )
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end

      context 'when JSON parsing fails' do
        before do
          allow(response).to receive(:body).and_return('invalid json')
          allow(client).to receive(:get).and_return(response)
          allow(Sentry).to receive(:capture_exception)
        end

        it 'captures the error and broadcasts an empty array' do
          expect(Sentry).to receive(:capture_exception).with(
            kind_of(NoMethodError),
            extra: { project_id: project.id, response_body: 'invalid json' }
          )
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end
    end
  end

  describe '#api_endpoint' do
    it 'returns the correct API endpoint' do
      expect(subject.api_endpoint).to eq("#{subject.base_url}/api/v1/assessments")
    end
  end
end
