# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Hogan::CopyAssessment, type: :model do
  let(:email) { 'user@example.com' }
  let!(:assessment) { create(:assessment, :hogan) }

  let!(:source_project) { create(:project, name: 'source_project') }
  let!(:source_user) do
    create(:user, email: email, project: source_project, hogan_credential: build(:hogan_credential))
  end
  let!(:source_campaign) { create(:campaign, project: source_project, name: 'source_campaign') }
  let!(:source_campaign_user) { create(:campaign_user, user: source_user, campaign: source_campaign) }
  let!(:source_user_assessment) do
    create(:user_assessment, subject: source_user, evaluator: source_user, campaign: source_campaign,
                             assessment: assessment)
  end

  let!(:target_project) { create(:project, name: 'target_project') }
  let!(:target_user) { create(:user, email: email, project: target_project) }
  let!(:target_campaign) { create(:campaign, project: target_project, name: 'target_campaign') }
  let!(:target_campaign_user) { create(:campaign_user, user: target_user, campaign: target_campaign) }
  let!(:target_user_assessment) do
    create(:user_assessment, subject: target_user, evaluator: target_user, campaign: target_campaign,
                             assessment: assessment)
  end

  let(:form) do
    Assessments::DataMigration::CopyAssessmentForm.new(
      email: email,
      to_campaign: target_campaign.id,
      from_campaign: source_campaign.id,
      assessment_id: assessment.id
    )
  end

  describe '#call' do
    subject { described_class.new(form, 1) }

    it 'copies the assessment from the source campaign to the target campaign' do
      subject.call

      expect(target_user_assessment.status).to eq(source_user_assessment.status)
      expect(target_user_assessment.completed_at).to eq(source_user_assessment.completed_at)
      expect(target_user_assessment.completion_reason).to eq(source_user_assessment.completion_reason)

      expect(target_user_assessment.resource_hogan_credential).to be_present
    end

    it 'copies the Hogan credentials if they do not exist for the target user' do
      source_credential = create(:hogan_credential, user: source_user)
      subject.call
      new_credential = HoganCredential.last
      expect(new_credential.user).to eq(target_user)
      expect(new_credential.hogan_group_name).to eq(source_credential.hogan_group_name)
    end

    it 'does not copy the Hogan credentials if they already exist for the target user' do
      create(:hogan_credential, user: target_user)
      expect { subject.call }.to raise_error(
        RuntimeError,
        "Row 1: Aborted! Hogan Credential present at target for user with id #{target_user.id}"
      )
    end

    it 'allow copy the Hogan credentials if they already exist for the target user and same as source credentials' do
      create(:hogan_credential, user: target_user, participant_id: source_user.hogan_credential.participant_id)
      expect { subject.call }.not_to raise_error
    end

    it 'recomputes the user results' do
      expect(UsersResults::RecomputeJob).to receive(:perform_later).with(anything, target_user)
      subject.call
    end
  end
end
