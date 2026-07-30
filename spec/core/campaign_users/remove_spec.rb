# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::Remove do
  let!(:campaign_user) { create :campaign_user }
  let(:campaign) { campaign_user.campaign }
  let(:user) { campaign_user.user }
  let!(:user_assessment) { create :user_assessment, campaign: campaign, subject: user }
  let!(:campaign_factor) { create(:campaign_factor, campaign: campaign) }
  let!(:campaign_factor_value) do
    create(:campaign_factor_value, campaign: campaign, user: user, campaign_factor: campaign_factor)
  end
  let(:options) { { campaign_user: campaign_user } }

  it 'deletes campaign_user record' do
    described_class.call!(options)

    expect(CampaignUser.find_by(id: campaign_user)).to be_nil
  end

  it 'removes associated user reports with user for campaign' do
    user_report = create :user_report, campaign: campaign, user: user
    described_class.call!(options)

    expect(UserReport.find_by(id: user_report.id)).to be_nil
  end

  it 'removes user assessment' do
    described_class.call!(options)

    expect(UserAssessment.find_by(id: user_assessment.id)).to be_nil
  end

  it 'removes campaign factor values' do
    described_class.call!(options)

    expect(CampaignFactorValue.find_by(id: campaign_factor_value.id)).to be_nil
  end

  context 'remove user result' do
    let(:users_result) { create :users_result }
    let!(:user_assessment_one) { create :user_assessment, campaign: campaign, subject: user }
    let!(:user_assessment_two) { create :user_assessment, users_result: users_result }

    it 'if its not associated with any other assessment' do
      described_class.call!(options)

      expect(UsersResult.find_by(id: user_assessment.users_result_id)).to be_nil
    end

    it 'do not removes user result if its associated with other user_assessment' do
      described_class.call!(options)

      expect(UsersResult.find_by(id: users_result.id)).to eq(users_result)
    end
  end
end
