# frozen_string_literal: true

require 'rails_helper'

describe Skillvue::InviteCandidate do
  let!(:project) { create(:project) }
  let(:config) { { 'api_key' => 'api_key' } }
  let(:assessment) do
    create(:assessment, :skillvue, project: project)
  end

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:skillvue_user_assessment) do
    create(:skillvue_user_assessment, user_assessment: user_assessment)
  end

  let(:redirect_url) { 'https://demo-cam.algointerview.it/36d0676c454f67d39e67aee0699a2edd/d07bd8b697006dbb8cca6a9fea552dc9' }

  let!(:registration_response) do
    {
      'success' => true,
      'error' => nil,
      'data' => {
        'redirect_url' => redirect_url,
        'candidate' => {
          'id' => '4@example.com',
          'name' => '45280',
          'surname' => '45280',
          'email' => '4@example.com'
        }
      }
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: registration_response.to_json) }

  subject { described_class.new(user_assessment) }

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
    allow(response).to receive(:body).and_return(registration_response.to_json)
    allow(response).to receive(:success?).and_return(true)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'invites candidate' do
        subject.call

        expect(skillvue_user_assessment.url).to eq(redirect_url)
        expect(skillvue_user_assessment.email).to eq('4@example.com')
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

      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end
  end
end
