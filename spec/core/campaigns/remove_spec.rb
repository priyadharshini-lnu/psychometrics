# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Remove do
  let(:campaign) { create(:campaign) }
  let!(:relationship) { create(:relationship, campaign: campaign) }
  let!(:user_report) { create(:user_report, campaign: campaign) }
  let!(:users_result) { create(:users_result, campaign: campaign) }
  let!(:campaign_report) { create(:campaign_report, campaign: campaign) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign) }
  let!(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }
  let!(:registration_code) { create(:registration_code, campaign: campaign) }

  context 'threesixty campaign with subject' do
    let(:threesixty_campaign_with_subjects) { create(:campaign, :threesixty, :with_subjects) }
    subject { described_class.call!(threesixty_campaign_with_subjects) }

    it 'doesnt removes campaign if subjects, evaluators and participants exists' do
      expect { subject }.to broadcast(:error)
      expect(Campaign.find_by(id: threesixty_campaign_with_subjects.id)).to eq(threesixty_campaign_with_subjects)
    end
  end

  context 'threesixty campaign without subject' do
    let(:threesixty_campaign) { create(:campaign, :threesixty) }
    subject { described_class.call!(threesixty_campaign) }

    it 'removes campaign if subjects, evaluators and participants do not exists' do
      expect { subject }.to broadcast(:ok)
      expect(Campaign.find_by(id: threesixty_campaign.id)).to be_nil
    end
  end

  context 'common campaign' do
    subject { described_class.call!(campaign) }

    it 'removes campaign and brodcast ok' do
      expect { subject }.to broadcast(:ok)
      expect(Campaign.find_by(id: campaign.id)).to be_nil
    end
  end

  it 'removes relationships' do
    described_class.call!(campaign)

    expect(Relationship.find_by(id: relationship.id)).to be_nil
  end

  it 'removes user_reports' do
    described_class.call!(campaign)

    expect(UserReport.find_by(id: user_report.id)).to be_nil
  end

  it 'removes user_results' do
    described_class.call!(campaign)

    expect(UsersResult.find_by(id: users_result.id)).to be_nil
  end

  it 'removes campaign_reports' do
    described_class.call!(campaign)

    expect(CampaignReport.find_by(id: campaign_report.id)).to be_nil
  end

  it 'removes campaign_assessments' do
    described_class.call!(campaign)

    expect(CampaignAssessment.find_by(id: campaign_assessment.id)).to be_nil
  end

  it 'removes campaign_assessment_groups' do
    described_class.call!(campaign)

    expect(CampaignAssessmentGroup.find_by(id: campaign_assessment_group.id)).to be_nil
  end

  it 'removes registration_codes' do
    described_class.call!(campaign)

    expect(RegistrationCode.find_by(id: registration_code.id)).to be_nil
  end
end
