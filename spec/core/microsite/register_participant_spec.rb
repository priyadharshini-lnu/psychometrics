# frozen_string_literal: true

require 'rails_helper'

describe Microsite::RegisterParticipant do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :microsite, project: project) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, campaign: campaign, project: project)
  end
  let(:config) { { 'api_key' => 'test_api_key', 'base_url' => 'http://localhost:4000' } }

  let(:assessment_url) { 'http://localhost:4000/assessment/test-123' }
  let(:success_response) do
    {
      'success' => true,
      'data' => {
        'participant_id' => 'uuid-123',
        'assessment_url' => assessment_url
      }
    }
  end

  let(:error_response) do
    {
      'success' => false,
      'message' => 'Invalid participant data'
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response) }

  subject { described_class.new(user_assessment) }

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when registration is successful' do
      before do
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:body).and_return(success_response)
        allow(response).to receive(:success?).and_return(true)
      end

      it 'creates microsite_user_assessment with registered status' do
        subject.call

        microsite_ua = user_assessment.reload.microsite_user_assessment
        expect(microsite_ua).to be_present
        expect(microsite_ua.registration_status).to eq('registered')
        expect(microsite_ua.url).to eq(assessment_url)
        expect(microsite_ua.participant_id).to be_present
        expect(microsite_ua.error_message).to be_nil
      end

      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end

    context 'when registration fails with API error' do
      before do
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:body).and_return(error_response)
        allow(response).to receive(:success?).and_return(false)
      end

      it 'creates microsite_user_assessment with failed status' do
        expect { subject.call }.to raise_error(Microsite::Exceptions::RegisterParticipantFailed)

        microsite_ua = user_assessment.reload.microsite_user_assessment
        expect(microsite_ua).to be_present
        expect(microsite_ua.registration_status).to eq('failed')
        expect(microsite_ua.error_message).to include('Invalid participant data')
      end
    end

    context 'when there is a network error' do
      let(:error) { Faraday::ConnectionFailed.new('Connection failed') }

      before do
        allow(client).to receive(:post).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures exception with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, extra: {
          user_assessment_id: user_assessment.id,
          project_id: project.id
        })

        expect { subject.call }.to raise_error(Faraday::ConnectionFailed)
      end

      it 'updates microsite_user_assessment with failed status' do
        expect { subject.call }.to raise_error(Faraday::ConnectionFailed)

        microsite_ua = user_assessment.reload.microsite_user_assessment
        expect(microsite_ua.registration_status).to eq('failed')
        expect(microsite_ua.error_message).to eq('Connection failed')
      end
    end

    context 'when microsite_user_assessment already exists' do
      let!(:existing_microsite_ua) do
        create(:microsite_user_assessment,
               user_assessment: user_assessment,
               participant_id: 'existing-uuid',
               registration_status: :pending)
      end

      before do
        allow(client).to receive(:post).and_return(response)
        allow(response).to receive(:body).and_return(success_response)
        allow(response).to receive(:success?).and_return(true)
      end

      it 'updates existing record instead of creating new one' do
        expect { subject.call }.not_to change(MicrositeUserAssessment, :count)

        existing_microsite_ua.reload
        expect(existing_microsite_ua.registration_status).to eq('registered')
        expect(existing_microsite_ua.url).to eq(assessment_url)
        expect(existing_microsite_ua.participant_id).to eq('existing-uuid')
      end
    end
  end
end
