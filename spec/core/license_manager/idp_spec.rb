# frozen_string_literal: true

require 'rails_helper'

describe LicenseManager::Idp do
  let(:client) { create(:tenancy) }
  let(:project) { create(:client, parent: client, subdomain: 'test-subdomain') }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let(:user_idp_plan) { create(:user_idp_plan) }
  let(:report_family) { create(:report_family) }
  let(:license) do
    create(:license, type: 'idp', client: client, report_family: report_family)
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

  describe '#create_license_usage!' do
    let(:idp_manager) do
      described_class.new(
        campaign: campaign,
        user: user,
        license: license
      )
    end

    context 'with valid idp_plan' do
      it 'creates a license_usage record' do
        expect do
          idp_manager.create_license_usage!(idp_plan: user_idp_plan)
        end.to change(LicenseUsage, :count).by(1)
      end

      it 'creates correct associations and returns the created license_usage' do
        result = idp_manager.create_license_usage!(idp_plan: user_idp_plan)
        expect(result).to be_an_instance_of(LicenseUsage)
        expect(result.user).to eq(user)
        expect(result.campaign).to eq(campaign)

        license_usage = LicenseUsage.last
        expect(license_usage.campaign).to eq(campaign)
        expect(license_usage.user).to eq(user)
        expect(license_usage.client).to eq(client)
        expect(license_usage.project).to eq(project)
        expect(license_usage.license).to eq(license)
        expect(license_usage.consumer).to eq(user_idp_plan)
        expect(license_usage.extras['subject_name']).to eq(user.name)
        expect(license_usage.extras['subject_email']).to eq(user.email)
        expect(license_usage.extras['campaign_name']).to eq(campaign.name)
        expect(license_usage.extras['idp_template_name']).to eq(user_idp_plan.idp_template.name)
      end
    end

    context 'with different user_idp_plan' do
      let(:another_user_idp_plan) { create(:user_idp_plan) }

      it 'creates license_usage with the correct idp_plan and idp_template_name' do
        idp_manager.create_license_usage!(idp_plan: another_user_idp_plan)

        license_usage = LicenseUsage.last
        expect(license_usage.consumer).to eq(another_user_idp_plan)
        expect(license_usage.extras['idp_template_name']).to eq(
          another_user_idp_plan.idp_template.name
        )
      end
    end

    context 'with multiple license_usages' do
      it 'creates separate records for different users' do
        another_user = create(:user)
        another_idp_manager = described_class.new(
          campaign: campaign,
          user: another_user,
          license: license
        )

        idp_manager.create_license_usage!(idp_plan: user_idp_plan)
        another_idp_manager.create_license_usage!(idp_plan: user_idp_plan)

        expect(LicenseUsage.count).to eq(2)
        expect(LicenseUsage.pluck(:user_id)).to contain_exactly(user.id, another_user.id)
      end

      it 'creates separate records for different campaigns' do
        another_campaign = create(:campaign, project: project)
        another_idp_manager = described_class.new(
          campaign: another_campaign,
          user: user,
          license: license
        )

        idp_manager.create_license_usage!(idp_plan: user_idp_plan)
        another_idp_manager.create_license_usage!(idp_plan: user_idp_plan)

        expect(LicenseUsage.count).to eq(2)
        expect(LicenseUsage.pluck(:campaign_id)).to contain_exactly(campaign.id, another_campaign.id)
      end
    end
  end
end
