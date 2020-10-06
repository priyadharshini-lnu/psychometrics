# frozen_string_literal: true

require 'rails_helper'

describe CampaignAssessments::Remove do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:assessment) { create(:assessment, :with_report) }
  let(:report) { assessment.reports.first }
  let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, subject: campaign_user.user, assessment: assessment)
  end
  let!(:user_report) { create(:user_report, report: report, user: campaign_user.user, campaign: campaign) }

  it 'deletes campaign_assessment record' do
    described_class.call!(campaign_assessment, campaign)

    expect(CampaignAssessment.find_by(id: campaign_assessment.id)).to be_nil
  end

  context 'if remove_user_assessments flag is true' do
    it 'deletes user_assessment record' do
      described_class.call!(campaign_assessment, campaign, remove_user_assessments: true)
      expect(UserAssessment.find_by(id: user_assessment.id)).to be_nil
    end
  end

  context 'if remove_user_assessments flag is false' do
    it 'doesnt deletes user_assessment record' do
      described_class.call!(campaign_assessment, campaign, remove_user_assessments: false)
      expect(UserAssessment.find_by(id: user_assessment.id)).to eq(user_assessment)
    end
  end
end
