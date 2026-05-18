# frozen_string_literal: true

require 'rails_helper'

describe LicenseManager::Proctoring do
  let(:client) { create(:tenancy) }
  let(:project) { create(:client, parent: client, subdomain: 'test-subdomain') }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:report_family) { create(:report_family) }
  let(:license) do
    create(:license, type: 'proctoring', client: client, report_family: report_family)
  end

  before do
    license.update(
      disabled: false,
      start_date: 10.days.ago,
      end_date: 10.days.from_now,
      number: 10,
      used_number: 0
    )
  end

  describe '#credits_required' do
    let(:proctoring_manager) do
      described_class.new(
        campaign: campaign,
        user: campaign_user,
        license: license
      )
    end

    context 'with valid campaign' do
      it 'calls Campaigns::Proctoring::GetProctoringCredits service' do
        expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).with(campaign, nil)

        proctoring_manager.credits_required
      end

      it 'returns the proctoring credits' do
        credits = 100
        allow(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(credits)

        result = proctoring_manager.credits_required

        expect(result).to eq(credits)
      end
    end
  end

  describe '#create_license_usage!' do
    let(:proctoring_manager) do
      described_class.new(
        campaign: campaign,
        user: campaign_user,
        license: license
      )
    end

    context 'with valid campaign_user' do
      it 'creates a license_usage record' do
        expect do
          proctoring_manager.create_license_usage!
        end.to change(LicenseUsage, :count).by(1)
      end

      it 'creates correct associations and returns the created license_usage' do
        result = proctoring_manager.create_license_usage!

        expect(result).to be_an_instance_of(LicenseUsage)
        expect(result.user).to eq(user)
        expect(result.campaign).to eq(campaign)

        license_usage = LicenseUsage.last
        expect(license_usage.campaign).to eq(campaign)
        expect(license_usage.user).to eq(user)
        expect(license_usage.client).to eq(client)
        expect(license_usage.project).to eq(project)
        expect(license_usage.license).to eq(license)
        expect(license_usage.extras['subject_name']).to eq(user.name)
        expect(license_usage.extras['subject_email']).to eq(user.email)
        expect(license_usage.extras['campaign_name']).to eq(campaign.name)
      end
    end

    context 'with different campaign_users' do
      let(:another_user) { create(:user) }
      let(:another_campaign_user) { create(:campaign_user, campaign: campaign, user: another_user) }

      it 'creates license_usage with the correct user' do
        another_proctoring_manager = described_class.new(
          campaign: campaign,
          user: another_campaign_user,
          license: license
        )

        another_proctoring_manager.create_license_usage!

        license_usage = LicenseUsage.last
        expect(license_usage.user).to eq(another_user)
      end

      it 'uses the correct user name in extras' do
        another_proctoring_manager = described_class.new(
          campaign: campaign,
          user: another_campaign_user,
          license: license
        )

        another_proctoring_manager.create_license_usage!

        license_usage = LicenseUsage.last
        expect(license_usage.extras['subject_name']).to eq(another_user.name)
      end
    end

    context 'with multiple license_usages' do
      it 'creates separate records for different users' do
        another_user = create(:user)
        another_campaign_user = create(:campaign_user, campaign: campaign, user: another_user)
        another_proctoring_manager = described_class.new(
          campaign: campaign,
          user: another_campaign_user,
          license: license
        )

        proctoring_manager.create_license_usage!
        another_proctoring_manager.create_license_usage!

        expect(LicenseUsage.count).to eq(2)
        expect(LicenseUsage.pluck(:user_id)).to contain_exactly(user.id, another_user.id)
      end

      it 'creates separate records for different campaigns' do
        another_campaign = create(:campaign, project: project)
        another_campaign_user = create(:campaign_user, campaign: another_campaign, user: user)
        another_proctoring_manager = described_class.new(
          campaign: another_campaign,
          user: another_campaign_user,
          license: license
        )

        proctoring_manager.create_license_usage!
        another_proctoring_manager.create_license_usage!

        expect(LicenseUsage.count).to eq(2)
        expect(LicenseUsage.pluck(:campaign_id)).to contain_exactly(campaign.id, another_campaign.id)
      end
    end

    context 'without project_license' do
      let(:proctoring_manager_no_project_license) do
        described_class.new(
          campaign: campaign,
          user: campaign_user,
          license: license
        )
      end

      it 'creates license_usage with nil project_license' do
        proctoring_manager_no_project_license.create_license_usage!

        license_usage = LicenseUsage.last
        expect(license_usage.project_license).to be_nil
      end

      it 'still stores all other associations and extras' do
        proctoring_manager_no_project_license.create_license_usage!

        license_usage = LicenseUsage.last
        expect(license_usage.user).to eq(user)
        expect(license_usage.campaign).to eq(campaign)
        expect(license_usage.client).to eq(client)
        expect(license_usage.project).to eq(project)
        expect(license_usage.extras['subject_name']).to eq(user.name)
      end
    end
  end
end
