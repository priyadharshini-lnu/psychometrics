# frozen_string_literal: true

require 'rails_helper'

describe Users::CreateAnonymCampaignUser do
  describe 'Creating user' do
    let(:campaign) { create(:campaign) }
    let(:assessment) { create(:assessment) }
    let(:report) { create(:report, assessments: [assessment]) }
    let(:report_family) { report.report_families.first }
    let!(:license) do
      create(
        :license,
        report_family: report_family,
        client: campaign.client,
        start_date: 2.days.ago,
        end_date: 2.days.since
      )
    end
    let!(:campaign_report) do
      create(:campaign_report, campaign: campaign, report: report, report_family: report_family)
    end
    let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }

    it 'succeeds' do
      allow_any_instance_of(SecuritySetting).to receive(:enforce_strong_password?).and_return(true)

      user = Users::CreateAnonymCampaignUser.call!(campaign_assessment)
      expect(user.persisted?).to be_truthy
      expect(user.is_anonym?).to be_truthy
    end

    it 'it creates campaign user and campaign_assessment' do
      user = Users::CreateAnonymCampaignUser.call!(campaign_assessment)

      expect(campaign.campaign_users.exists?(user: user)).to be_truthy
      expect(UserAssessment.exists?(subject: user, campaign: campaign, assessment: assessment)).to be_truthy
    end

    it 'raises a license error when there are not enough licenses' do
      license.update(number: 10, used_number: 10)

      expect do
        Users::CreateAnonymCampaignUser.call!(campaign_assessment)
      end.to raise_error(Licenses::NotEnoughError)
    end
  end
end
