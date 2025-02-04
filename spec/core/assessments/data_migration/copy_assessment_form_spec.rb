# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessments::DataMigration::CopyAssessmentForm do
  let(:email) { 'user@example.com' }
  let!(:assesmsent) { create(:assessment, :saville) }

  let!(:source_project) { create(:project, name: 'source_project') }
  let!(:source_user) { create(:user, email: email, project: source_project) }
  let!(:source_campaign) { create(:campaign, project: source_project, name: 'source_campaign') }
  let!(:source_campaign_user) { create(:campaign_user, user: source_user, campaign: source_campaign) }
  let!(:source_user_assessment) do
    create(:user_assessment, subject: source_user, evaluator: source_user, campaign: source_campaign,
    assessment: assesmsent)
  end

  let!(:target_project) { create(:project, name: 'target_project') }
  let!(:target_user) { create(:user, email: email, project: target_project) }
  let!(:target_campaign) { create(:campaign, project: target_project, name: 'target_campaign') }
  let!(:target_campaign_user) { create(:campaign_user, user: target_user, campaign: target_campaign) }
  let!(:target_user_assessment) do
    create(:user_assessment, subject: target_user, evaluator: target_user, campaign: target_campaign,
    assessment: assesmsent)
  end

  subject(:form) do
    described_class.new(
      email: email,
      to_campaign: target_campaign.id,
      from_campaign: source_campaign.id,
      assessment_id: assesmsent.id
    )
  end

  describe 'validations' do
    context 'when all conditions are met' do
      it 'is valid' do
        expect(form).to be_valid
      end
    end

    context 'when user is not in from campaign' do
      before do
        source_user.destroy
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("User not in 'from' campaign")
      end
    end

    context 'when user is not in to campaign' do
      before do
        target_user.destroy
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("User not in 'to' campaign")
      end
    end

    context 'when there is no assessment in to campaign' do
      before do
        target_user_assessment.destroy
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("No assessment in 'to' campaign")
      end
    end

    context 'when there is no assessment in from campaign' do
      before do
        source_user_assessment.destroy
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("No assessment in 'from' campaign")
      end
    end
  end
end
