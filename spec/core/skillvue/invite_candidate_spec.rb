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
  let(:encoded_id) { UserAssessment.encode_id(user_assessment.id) }

  let(:interview_url) { Faker::Internet.url }

  let!(:registration_response) do
    {
      'success' => true,
      'error' => nil,
      'data' => {
        'interview_url' => interview_url,
        'candidate' => {
          'id' => encoded_id,
          'name' => '23740',
          'surname' => '23740',
          'email' => 'wy5p7w-ac068a3c0a@example.com',
          'redirect_url' => 'https://mercer.localhost:3030/skillvue_user_assessments/26110/redirect?jwt=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjIzNzQwLCJleHAiOjE3NTE1MjkyODN9.eWwvIlBLN2Jhsa8eHi6Sy2Ozc-bO7Qsx3_dli0ZKW10&project_id=288'
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

        expect(skillvue_user_assessment.url).to eq(interview_url)
        expect(skillvue_user_assessment.email).to eq('wy5p7w-ac068a3c0a@example.com')
        expect(skillvue_user_assessment.external_user_id).to eq(encoded_id)
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
