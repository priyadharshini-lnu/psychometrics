# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Hogan::HandleAssignHoganAssessments do
  let(:user) { create(:user) }
  let(:assessment) { create(:hogan_assessment, external_settings: { assessment_id: '1', form_id: '2' }) }
  let(:user_assessments) { create_list(:user_assessment, 1, subject: user, assessment: assessment) }
  let(:user_report) { create(:user_report, user: user) }
  let(:options) { { operation: 'add_with_existing_response' } }
  let!(:hogan_credential) { create(:hogan_credential, user: user) }
  let(:participant_profile) do
    { 'assessmentDetails' => [{ 'assessmentId' => '1', 'formId' => '2', 'status' => 'Completed' }] }
  end

  subject { described_class.new(user, user_assessments, user_report, options) }

  before do
    allow(Services::Hogan::Api::Json::GetParticipantProfile).to receive(:call!).and_return(participant_profile)
  end

  describe '#call' do
    context 'when existing_hogan_credential is blank' do
      before { allow(user).to receive(:hogan_credential).and_return(nil) }

      it 'does not process assessments' do
        expect(Services::Hogan::Api::Json::GetParticipantProfile).not_to receive(:call!)
        subject.call
      end
    end

    context 'when user_assessment is not Hogan' do
      before { allow(user_assessments.first).to receive(:hogan?).and_return(false) }

      it 'does not process the assessment' do
        expect(Services::Hogan::Api::Json::GetParticipantProfile).not_to receive(:call!)
        subject.call
      end
    end

    context 'when operation is add_with_existing_response' do
      it 'handles existing response with completed assessments' do
        expect(Hogan::HandleAssessmentCompletion).to receive(:call!)

        subject.call

        user_assessment = user_assessments.last
        expect(user_assessment.status).to eq('completed')
        expect(user_assessment.resource_hogan_credential.present?).to be_truthy
        expect(user_assessment.resource_hogan_credential.hogan_credential_id).to eq(hogan_credential.id)
      end

      it 'handles existing response with assessments not completed in hogan' do
        allow(Services::Hogan::Api::Json::GetParticipantProfile).to receive(:call!).and_return(
          { 'assessmentDetails' => [{ 'assessmentId' => '1', 'formId' => '2', 'status' => 'Pending' }] }
        )

        expect(Hogan::HandleAssessmentCompletion).not_to receive(:call!)

        subject.call

        user_assessment = user_assessments.last
        expect(user_assessment.status).to eq('not_started')
        expect(user_assessment.resource_hogan_credential.present?).to be_truthy
        expect(user_assessment.resource_hogan_credential.hogan_credential_id).to eq(hogan_credential.id)
      end
    end

    context 'when operation is add_and_allow_new_response' do
      let(:options) { { operation: 'add_and_allow_new_response' } }

      it 'handles new response with assessment completed already' do
        expect { subject.call }.to raise_error(Hogan::Exceptions::NewAssessmentResponseNotAllowed)
      end

      it 'handles new response with assessment not started' do
        allow(Services::Hogan::Api::Json::GetParticipantProfile).to receive(:call!).and_return(
          { 'assessmentDetails' => [{ 'assessmentId' => '1', 'formId' => '2', 'status' => 'NotAssigned' }] }
        )

        expect { subject.call }.not_to raise_error

        user_assessment = user_assessments.last
        expect(user_assessment.status).to eq('not_started')
        expect(user_assessment.resource_hogan_credential.present?).to be_truthy
        expect(user_assessment.resource_hogan_credential.hogan_credential_id).to eq(hogan_credential.id)
      end
    end
  end
end
