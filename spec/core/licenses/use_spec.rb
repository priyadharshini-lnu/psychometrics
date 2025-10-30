# frozen_string_literal: true

require 'rails_helper'

describe Licenses::Use do
  let(:campaign) { create(:campaign) }
  let(:client) { campaign.client }
  let(:user) { create(:user) }
  let(:report) { create(:report) }
  let(:report_family) { report.report_families.first }
  let(:report_family_id) { report_family.id }

  it 'use license when enough licenses are present' do
    license = create(:license, report_family: report_family, client: client,
      start_date: 2.days.ago, end_date: 2.days.since, number: 2)
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([license])

    license_usage = described_class.call!(campaign, user, report, report_family_id)

    expect(license_usage.license_id).to eq(license.id)
    expect(license_usage.user_id).to eq(user.id)
    expect(license_usage.client_id).to eq(campaign.client.id)
  end

  it 'returns error when there are no licenses present' do
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([])

    expect { described_class.call(campaign, user, report, report_family_id) }.to raise_error(
      Licenses::NotEnoughError, I18n.t('licenses.not_enough_license', client_name: client.name,
report_name: report.name)
    )
  end

  it 'returns error if license is present but they are expired' do
    expired_license = create(:license, report_family: report_family, client: client, start_date: 3.days.ago,
      end_date: 2.days.ago, number: 2)
    allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([expired_license])

    expect { described_class.call(campaign, user, report, report_family_id) }.to raise_error(
      Licenses::NotEnoughError, "'#{client.name}' does not have enough licenses for '#{report.name}'"
    )
  end

  context 'with project license' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:license) do
      create(:license, report_family: report_family, client: client, is_project_specific: true, number: 2)
    end

    before do
      allow_any_instance_of(Licenses::FetchQuery).to receive(:query).and_return([license])
    end

    context 'when project has enough licenses' do
      let!(:project_license) do
        create(:project_license, license: license, project: project, usage_limit: 1, used_number: 0)
      end

      it 'uses license and returns a LicenseUsage with correct associations' do
        license_usage = described_class.call!(campaign, user, report, report_family_id)

        expect(license_usage).to be_present
        expect(license_usage.license_id).to eq(license.id)
        expect(license_usage.user_id).to eq(user.id)
        expect(license_usage.client_id).to eq(campaign.client.id)
        expect(license_usage.project_id).to eq(project.id)
        expect(license_usage.campaign_id).to eq(campaign.id)
        expect(license_usage.project_license_id).to eq(project_license.id)
      end

      it 'creates a LicenseUsage record tied to the project_license with correct references' do
        described_class.call!(campaign, user, report, report_family_id)

        license_usage = LicenseUsage.last
        expect(license_usage).to be_present
        expect(license_usage.project_license_id).to eq(project_license.id)
        expect(license_usage.project_id).to eq(project.id)
        expect(license_usage.user_id).to eq(user.id)
        expect(license_usage.campaign_id).to eq(campaign.id)
        expect(license_usage.client_id).to eq(campaign.client.id)
        expect(license_usage.license_id).to eq(license.id)
      end
    end

    context 'when project does not have enough licenses' do
      let!(:project_license) do
        create(:project_license, license: license, project: project, usage_limit: 1, used_number: 1)
      end

      it 'returns error' do
        expect { described_class.call(campaign, user, report, report_family_id) }.to raise_error(
          Licenses::NotEnoughError, I18n.t('licenses.project_limit_reached', license_name: license.report_family.name)
        )
      end
    end

    context 'when project license is disabled' do
      let!(:project_license) do
        create(:project_license, license: license, project: project, usage_limit: 1, used_number: 0, enabled: false)
      end

      it 'returns error' do
        expect { described_class.call(campaign, user, report, report_family_id) }.to raise_error(
          Licenses::NotEnoughError, I18n.t('licenses.project_limit_reached', license_name: license.report_family.name)
        )
      end
    end

    context 'when project license is not present' do
      it 'returns error' do
        expect { described_class.call(campaign, user, report, report_family_id) }.to raise_error(
          Licenses::NotEnoughError, I18n.t('licenses.project_limit_reached', license_name: license.report_family.name)
        )
      end
    end
  end
end
