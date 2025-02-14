# frozen_string_literal: true

require 'rails_helper'

describe Hogan::StartAssessment do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }
  let(:assessment) { create(:hogan_assessment, dimension: nil) }
  let(:hogan_report) { create(:report, :hogan, assessments: [assessment]) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, evaluator: user, subject: user) }
  let!(:hogan_user_report) do
    create(:user_report, report: hogan_report, campaign: user_assessment.campaign, user: user)
  end

  let(:context) { { params: { id: user_assessment.id }, current_user: user } }

  let(:start_assessment) { described_class.new(context) }

  let(:async_response) do
    AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :json,
      response_data: nil
    )
  end

  describe '#call' do
    context 'when the assessment is not a hogan assessment' do
      it 'broadcasts :invalid and returns async_response' do
        allow(user_assessment.assessment).to receive(:hogan?).and_return(false)

        expect { start_assessment.call }.to broadcast(:invalid, async_response)
      end
    end

    context 'when the assessment is a hogan assessment' do
      before(:each) do
        expect(Services::Hogan::Api::Json::GroupDetails).to receive(:call).and_return(double('res', success?: true))
        expect(Services::Hogan::Api::Json::AddParticipantToGroup).to receive(:call!).
          and_return(1)
        expect(Services::Hogan::Api::Json::AddParticipantAssessment).to receive(:call!).
          and_return(double('res', success?: true))
      end

      it 'sets the user_assessment to in_progress' do
        start_assessment.call

        expect(user_assessment.reload.status).to eq('in_progress')
      end

      it 'sets the norm as Global2023' do
        start_assessment.call

        hogan_credential = user.reload.hogan_credential

        expect(hogan_credential.norm).to eq('Global2023')
      end

      it 'creates hogan credentials' do
        start_assessment.call

        hogan_credential = user.reload.hogan_credential

        expect(hogan_credential.participant_id).to eq('1')
        expect(hogan_credential.provider).to eq('phoenix')
      end

      it 'creates resource hogan credentials' do
        start_assessment.call

        hogan_credential = user.reload.hogan_credential
        resource_hogan_credential = ResourceHoganCredential.find_by(resource: user_assessment)
        resource_hogan_credential_of_report = ResourceHoganCredential.find_by(resource: hogan_user_report)

        expect(resource_hogan_credential.hogan_credential).to eq(hogan_credential)
        expect(resource_hogan_credential.hogan_credential.participant_id).to eq('1')
        expect(resource_hogan_credential.hogan_credential.provider).to eq('phoenix')

        expect(resource_hogan_credential_of_report.hogan_credential).to eq(hogan_credential)
        expect(resource_hogan_credential_of_report.hogan_credential.participant_id).to eq('1')
        expect(resource_hogan_credential_of_report.hogan_credential.provider).to eq('phoenix')
      end

      it 'broadcasts :ok and returns async_response' do
        expect { start_assessment.call }.to broadcast(:ok) do |async_response|
          expect(async_response).to be_a(AsyncResponseRequest::AsyncResponse)
          expect(async_response.processing_status).to eq(:completed)
          expect(async_response.response_type).to eq(:json)
          expect(async_response.response_type['direct_assessment_id']).to eq('assessmentId')
        end
      end

      context 'provider is set as mercer in integration' do
        let!(:integration) { create(:integration, :hogan_integration, project: project) }

        it 'creates hogan credentials with mercer as provider' do
          start_assessment.call

          hogan_credential = user.reload.hogan_credential

          expect(hogan_credential.participant_id).to eq('1')
          expect(hogan_credential.provider).to eq('mercer')
        end
      end

      context 'default_provider is set as mercer in secrets' do
        before do
          allow(Settings.secrets.hogan).to receive(:default_provider).and_return('mercer')
        end

        it 'creates hogan credentials with mercer as provider' do
          start_assessment.call

          hogan_credential = user.reload.hogan_credential

          expect(hogan_credential.participant_id).to eq('1')
          expect(hogan_credential.provider).to eq('mercer')
        end
      end
    end
  end
end
