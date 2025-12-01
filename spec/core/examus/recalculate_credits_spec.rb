# frozen_string_literal: true

require 'rails_helper'

describe Examus::RecalculateCredits do
  let(:campaign_options) { create(:campaign_option, fixed_time_duration: 3600) }
  let(:campaign) { create(:campaign, campaign_options: campaign_options) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:proctoring_session) do
    create(
      :proctoring_session,
      completed_at: '2020-10-15 16:32:40',
      campaign_user: campaign_user,
      license_usage: license_usage
    )
  end

  context 'with generic license' do
    let(:license) { create(:proctoring_license, number: 20, used_number: 6, is_project_specific: false) }
    let(:license_usage) { create(:license_usage, license: license, campaign: campaign, proctoring_credits_debited: 6) }

    it 'should return unused credits and decrement license used_number' do
      expect(Campaigns::Proctoring::GetProctoringCredits.call!(campaign)).to eq(6)
      expect(license.used_number).to eq(6)
      described_class.call!(proctoring_session)
      expect(license_usage.proctoring_credits_credited).to eq(5)
      expect(license_usage.proctoring_session_duration).to eq(2160)
      expect(license.reload.used_number).to eq(5)
    end

    it 'should calculate credits based on session duration' do
      expect(Campaigns::Proctoring::GetProctoringCredits.call!(campaign)).to eq(6)
      expect(license.used_number).to eq(6)
      proctoring_session.completed_at = '2020-10-15 16:25:40'
      described_class.call!(proctoring_session)
      expect(license_usage.proctoring_credits_credited).to eq(4)
      expect(license_usage.proctoring_session_duration).to eq(1740)
      expect(license.reload.used_number).to eq(4)
    end
  end

  context 'with project-specific license' do
    let(:project) { campaign.project }
    let(:license) do
      create(:proctoring_license, number: 20, used_number: 6, is_project_specific: true, client: campaign.client)
    end
    let(:project_license) do
      create(:project_license, project: project, license: license, usage_limit: 10, used_number: 6)
    end
    let(:license_usage) do
      create(:license_usage, license: license, campaign: campaign, proctoring_credits_debited: 6,
project_license: project_license)
    end

    it 'should decrement both license and project_license used_number' do
      expect(license.used_number).to eq(6)
      expect(project_license.used_number).to eq(6)
      described_class.call!(proctoring_session)
      expect(license_usage.proctoring_credits_credited).to eq(5)
      expect(license.reload.used_number).to eq(5)
      expect(project_license.reload.used_number).to eq(5)
    end

    it 'should credit unused credits and update both counters' do
      expect(license.used_number).to eq(6)
      proctoring_session.completed_at = '2020-10-15 16:25:40'
      described_class.call!(proctoring_session)
      expect(license_usage.proctoring_credits_credited).to eq(4)
      expect(license_usage.proctoring_session_duration).to eq(1740)
      expect(license.reload.used_number).to eq(4)
      expect(project_license.reload.used_number).to eq(4)
    end

    it 'should not decrement if no difference in credits' do
      license_usage.update(proctoring_credits_debited: 5)
      described_class.call!(proctoring_session)
      expect(license.reload.used_number).to eq(6)
      expect(project_license.reload.used_number).to eq(6)
    end
  end

  context 'when license_usage already has credits_credited' do
    let(:license) { create(:proctoring_license, number: 20, used_number: 6) }
    let(:license_usage) do
      create(:license_usage, license: license, campaign: campaign, proctoring_credits_debited: 6,
proctoring_credits_credited: 5)
    end

    it 'should return ok without processing' do
      described_class.call!(proctoring_session)
      expect(license.reload.used_number).to eq(6)
    end
  end
end
