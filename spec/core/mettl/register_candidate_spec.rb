# frozen_string_literal: true

require 'rails_helper'

describe Mettl::RegisterCandidate do
  let!(:project) { create(:project) }
  let(:config) { { 'public_key' => 'public_key_value', 'private_key' => 'private_key_value' } }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.id })
  end

  let!(:mettl_schedule) { create(:mettl_schedule, project: project, assessment: assessment) }

  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:mettl_user_assessment) do
    create(:mettl_user_assessment, user_assessment: user_assessment)
  end

  let(:schedule_link) { Faker::Internet.url }

  let!(:registration_response) do
    {
      'status' => 'SUCCESS',
      'registrationStatus' =>
        [{
          'email' => 'some_email@cc.com',
          'status' => 'ToBeTaken',
          'message' => "Candidate ('some_email@cc.com') successfully registered for the test",
          'url' => schedule_link
        }]
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
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'register candidate' do
        subject.call

        expect(mettl_user_assessment.url).to eq(schedule_link)
        expect(mettl_user_assessment.email).to eq('some_email@cc.com')
        expect(mettl_user_assessment.mettl_schedule_id).to eq(mettl_schedule.id)
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

      it 'broadcasts :ok with an empty array' do
        expect(subject).to receive(:broadcast).with(:ok, [])
        subject.call
      end
    end
  end
end
