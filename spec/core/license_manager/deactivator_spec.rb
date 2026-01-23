# frozen_string_literal: true

require 'rails_helper'

describe LicenseManager::Deactivator do
  let(:client) { create(:tenancy) }
  let(:project) { create(:client, parent: client, subdomain: 'test-subdomain') }
  let(:campaign) { create(:campaign, :threesixty, project: project) }
  let(:updater_id) { create(:user).id }

  let(:license) do
    create(:license, type: 'threesixty', client: client, is_project_specific: true)
  end

  before do
    license.update(
      disabled: false,
      start_date: 10.days.ago,
      end_date: 10.days.from_now,
      number: 10,
      used_number: 5
    )
  end

  describe '#call' do
    context 'when deactivating single user' do
      let(:user) { create(:user) }
      let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
      let(:license_usage) do
        create(:license_usage, license: license, campaign: campaign, project: project, user: user, status: :active)
      end

      before do
        license_usage
      end

      it 'marks license_usage as inactive and decrements license used_number' do
        time_before = Time.zone.now
        deactivator = described_class.new(
          campaign: campaign,
          updater_id: updater_id,
          user_ids_for_deactivation: [user.id]
        )

        expect do
          deactivator.call
        end.to change { license.reload.used_number }.from(5).to(4)

        time_after = Time.zone.now

        expect(license_usage.reload.status).to eq('inactive')
        expect(license_usage.reload.status_updated_by_id).to eq(updater_id)
        expect(license_usage.reload.status_updated_at).to be_between(time_before, time_after)
      end
    end

    context 'when deactivating multiple users' do
      let(:user1) { create(:user) }
      let(:user2) { create(:user) }
      let(:user3) { create(:user) }

      let(:license_usage1) do
        create(:license_usage, license: license, campaign: campaign, project: project, user: user1, status: :active)
      end
      let(:license_usage2) do
        create(:license_usage, license: license, campaign: campaign, project: project, user: user2, status: :active)
      end
      let(:license_usage3) do
        create(:license_usage, license: license, campaign: campaign, project: project, user: user3, status: :active)
      end

      let(:another_campaign) { create(:campaign, project: project) }
      let(:license_usage_for_another_campaign) do
        create(:license_usage, license: license, campaign: another_campaign, user: user1, status: :active)
      end

      before do
        license_usage1
        license_usage2
        license_usage3
        license_usage_for_another_campaign
        license.update(used_number: 3)
      end

      it 'deactivates only selected users' do
        deactivator = described_class.new(
          campaign: campaign,
          updater_id: updater_id,
          user_ids_for_deactivation: [user1.id, user2.id]
        )
        expect(license.used_number).to eq(3)

        deactivator.call

        expect(license.reload.used_number).to eq(1)
        expect(license_usage1.reload.status).to eq('inactive')
        expect(license_usage1.reload.status_updated_by_id).to eq(updater_id)
        expect(license_usage2.reload.status).to eq('inactive')
        expect(license_usage2.reload.status_updated_by_id).to eq(updater_id)
        expect(license_usage3.reload.status).to eq('active')
        expect(license_usage3.reload.status_updated_by_id).to be_nil
        expect(license_usage_for_another_campaign.reload.status).to eq('active')
        expect(license_usage_for_another_campaign.reload.status_updated_by_id).to be_nil
      end
    end

    context 'with project_specific license' do
      let(:project_license) do
        create(:project_license, license: license, project: project)
      end

      let(:user) { create(:user) }

      let(:license_usage) do
        create(
          :license_usage,
          license: license,
          project_license: project_license,
          campaign: campaign,
          project: project,
          user: user,
          status: :active
        )
      end

      before do
        project_license.update(
          enabled: true,
          usage_limit: 10,
          used_number: 5
        )
        license_usage
      end

      it 'decrements both license and project_license used_number and marks license_usage as inactive' do
        deactivator = described_class.new(
          campaign: campaign,
          updater_id: updater_id,
          user_ids_for_deactivation: [user.id]
        )

        expect do
          deactivator.call
        end.to change { license.reload.used_number }.from(5).to(4).
          and change { project_license.reload.used_number }.from(5).to(4).
          and change { license_usage.reload.status }.from('active').to('inactive')
      end
    end

    context 'when no active license_usages exist' do
      let(:user) { create(:user) }

      it 'does not raise error' do
        deactivator = described_class.new(
          campaign: campaign,
          updater_id: updater_id,
          user_ids_for_deactivation: [user.id]
        )

        expect { deactivator.call }.not_to raise_error
      end

      it 'does not change license used_number' do
        deactivator = described_class.new(
          campaign: campaign,
          updater_id: updater_id,
          user_ids_for_deactivation: [user.id]
        )

        expect do
          deactivator.call
        end.not_to(change { license.reload.used_number })
      end
    end

    context 'when deactivating inactive license_usage' do
      let(:user) { create(:user) }

      let(:license_usage) do
        create(:license_usage, license: license, campaign: campaign, project: project, user: user, status: :inactive)
      end

      before do
        license_usage
      end

      it 'does not change status or decrement license used_number' do
        deactivator = described_class.new(
          campaign: campaign,
          updater_id: updater_id,
          user_ids_for_deactivation: [user.id]
        )

        expect do
          deactivator.call
        end.not_to(change { license.reload.used_number })

        expect(license_usage.reload.status).to eq('inactive')
      end
    end
  end
end
