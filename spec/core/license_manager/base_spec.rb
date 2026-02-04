# frozen_string_literal: true

require 'rails_helper'

describe LicenseManager::Base do
  let(:client) { create(:tenancy) }
  let(:project) { create(:client, parent: client, subdomain: 'abpro1cws') }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let(:license) { create(:license, client: client, type: 'common') }

  subject(:license_manager) { described_class.new(license: license, campaign: campaign, user: user) }

  describe '#available?' do
    context 'when all common checks pass' do
      before do
        license.update(
          disabled: false,
          start_date: 10.days.ago,
          end_date: 10.days.from_now,
          number: 10,
          used_number: 2,
          overuse_number: 0
        )
      end

      it 'returns true' do
        expect(license_manager.available?).to be true
      end
    end

    context 'when license is disabled' do
      before do
        license.update(disabled: true)
      end

      it 'returns false' do
        expect(license_manager.available?).to be false
      end
    end

    context 'when license is expired' do
      before do
        license.update(
          start_date: 30.days.ago,
          end_date: 10.days.ago
        )
      end

      it 'returns false' do
        expect(license_manager.available?).to be false
      end
    end

    context 'when license has not started yet' do
      before do
        license.update(
          start_date: 10.days.from_now,
          end_date: 20.days.from_now
        )
      end

      it 'returns false' do
        expect(license_manager.available?).to be false
      end
    end

    context 'when license is project-specific but project_license is nil' do
      before do
        license.update(is_project_specific: true)
      end

      it 'returns false' do
        expect(license_manager.available?).to be false
      end
    end

    context 'with project-specific license' do
      let(:project_license) do
        create(:project_license, license: license, project: project, enabled: true, usage_limit: 5, used_number: 2)
      end

      before do
        license.update(
          is_project_specific: true,
          disabled: false,
          start_date: 10.days.ago,
          end_date: 10.days.from_now,
          number: 10,
          used_number: 2,
          overuse_number: 0
        )
        project_license
      end

      it 'checks both main and project license availability' do
        expect(license_manager.available?).to be true
      end

      context 'when project_license is disabled' do
        before do
          project_license.update(enabled: false)
        end

        it 'returns false' do
          expect(license_manager.available?).to be false
        end
      end

      context 'when project_license has no remaining usage' do
        before do
          project_license.update(used_number: 5)
        end

        it 'returns false' do
          expect(license_manager.available?).to be false
        end
      end
    end
  end

  describe '#main_license_available_for_use?' do
    context 'when credits are available' do
      before do
        license.update(number: 10, used_number: 2, overuse_number: 5)
      end

      it 'returns true' do
        expect(license_manager.send(:main_license_available_for_use?)).to be true
      end
    end

    context 'when all credits are used' do
      before do
        license.update(number: 10, used_number: 10, overuse_number: 0)
      end

      it 'returns false' do
        expect(license_manager.send(:main_license_available_for_use?)).to be false
      end
    end

    context 'with overuse credits' do
      before do
        license.update(number: 10, used_number: 12, overuse_number: 5)
      end

      it 'returns true when overuse is available' do
        expect(license_manager.send(:main_license_available_for_use?)).to be true
      end
    end

    context 'when exactly one credit remains' do
      before do
        license.update(number: 10, used_number: 9, overuse_number: 0)
      end

      it 'returns true' do
        expect(license_manager.send(:main_license_available_for_use?)).to be true
      end
    end
  end

  describe '#project_license_available_for_use?' do
    let(:project_license) { create(:project_license, license: license, project: project) }

    before do
      license.update(is_project_specific: true)
      project_license
    end

    context 'when project_license is enabled and has remaining usage' do
      before do
        project_license.update(enabled: true, usage_limit: 10, used_number: 5)
      end

      it 'returns true' do
        expect(license_manager.send(:project_license_available_for_use?)).to be true
      end
    end

    context 'when project_license is disabled' do
      before do
        project_license.update(enabled: false)
      end

      it 'returns false' do
        expect(license_manager.send(:project_license_available_for_use?)).to be false
      end
    end

    context 'when all project_license usage is consumed' do
      before do
        project_license.update(enabled: true, usage_limit: 10, used_number: 10)
      end

      it 'returns false' do
        expect(license_manager.send(:project_license_available_for_use?)).to be false
      end
    end

    context 'when there is no project_license' do
      before do
        license.update(is_project_specific: false)
      end

      it 'returns false' do
        expect(license_manager.send(:project_license_available_for_use?)).to be false
      end
    end
  end

  describe '#deduct_license!' do
    before do
      license.update(
        disabled: false,
        start_date: 10.days.ago,
        end_date: 10.days.from_now,
        number: 10,
        used_number: 2,
        overuse_number: 0
      )
    end

    context 'when license is available' do
      it 'creates license usage record' do
        expect do
          license_manager.deduct_license!
        end.to change(LicenseUsage, :count).by(1)
      end

      it 'increments license used_number' do
        expect do
          license_manager.deduct_license!
        end.to change { license.reload.used_number }.by(1)
      end

      it 'returns hash with license data' do
        result = license_manager.deduct_license!

        expect(result).to include(
          license: license,
          project_license: nil,
          license_usage: an_instance_of(LicenseUsage)
        )
      end

      it 'calls after_license_usage_created_callback' do
        expect(license_manager).to receive(:after_license_usage_created_callback)

        license_manager.deduct_license!
      end
    end

    context 'when license is not available' do
      before do
        license.update(disabled: true)
      end

      it 'does not create license usage' do
        expect do
          license_manager.deduct_license!
        end.not_to change(LicenseUsage, :count)
      end

      it 'returns false' do
        expect(license_manager.deduct_license!).to be false
      end
    end

    context 'with project-specific license' do
      let(:project_license) do
        create(:project_license, license: license, project: project, enabled: true, usage_limit: 10, used_number: 2)
      end

      before do
        license.update(is_project_specific: true)
        project_license
      end

      it 'increments both licenses' do
        expect do
          license_manager.deduct_license!
        end.to change { license.reload.used_number }.by(1).
          and change { project_license.reload.used_number }.by(1)
      end

      it 'associates license_usage with project_license' do
        license_manager.deduct_license!
        license_usage = LicenseUsage.last

        expect(license_usage.project_license).to eq(project_license)
      end
    end
  end

  describe '#create_license_usage!' do
    before do
      license.update(
        disabled: false,
        start_date: 10.days.ago,
        end_date: 10.days.from_now
      )
    end

    it 'creates a license usage record with correct attributes' do
      license_usage = license_manager.send(:create_license_usage!)

      expect(license_usage).to be_persisted
      expect(license_usage.campaign).to eq(campaign)
      expect(license_usage.client).to eq(client)
      expect(license_usage.user).to eq(user)
      expect(license_usage.project).to eq(project)
    end

    it 'stores user and campaign information in extras' do
      license_usage = license_manager.send(:create_license_usage!)

      expect(license_usage.extras['subject_name']).to eq(user.name)
      expect(license_usage.extras['campaign_name']).to eq(campaign.name)
      expect(license_usage.extras['subject_email']).to eq(user.email)
    end
  end

  describe '#after_license_usage_created_callback' do
    before do
      license.update(
        number: 10,
        used_number: 0,
        overuse_number: 2
      )
    end

    it 'increments license used_number' do
      expect do
        license_manager.send(:after_license_usage_created_callback)
      end.to change { license.reload.used_number }.by(1)
    end

    context 'with project-specific license' do
      let(:project_license) { create(:project_license, license: license, project: project, used_number: 0) }

      before do
        license.update(is_project_specific: true)
        project_license
      end

      it 'increments project_license used_number' do
        expect do
          license_manager.send(:after_license_usage_created_callback)
        end.to change { project_license.reload.used_number }.by(1)
      end

      it 'increments both license and project_license used_number' do
        expect do
          license_manager.send(:after_license_usage_created_callback)
        end.to change { license.reload.used_number }.by(1).
          and change { project_license.reload.used_number }.by(1)
      end
    end

    context 'when overuse is triggered' do
      it 'enqueues OveruseJob only when used_overuse_number equals 1' do
        allow(license).to receive(:used_overuse_number).and_return(1)
        expect(Licenses::OveruseJob).to receive(:perform_later).with(license.id)

        license_manager.send(:after_license_usage_created_callback)
      end
    end

    context 'when overuse is not triggered' do
      before do
        license.update(overuse_number: 0)
      end

      it 'does not enqueue OveruseJob' do
        allow(license).to receive(:used_overuse_number).and_return(0)
        expect(Licenses::OveruseJob).not_to receive(:perform_later)

        license_manager.send(:after_license_usage_created_callback)
      end
    end
  end

  describe '#common_checks?' do
    context 'when license is disabled' do
      before do
        license.update(disabled: true)
      end

      it 'returns false' do
        expect(license_manager.send(:common_checks?)).to be false
      end
    end

    context 'when license is within valid date range' do
      before do
        license.update(
          disabled: false,
          start_date: 10.days.ago,
          end_date: 10.days.from_now
        )
      end

      it 'returns true' do
        expect(license_manager.send(:common_checks?)).to be true
      end
    end

    context 'when license is expired' do
      before do
        license.update(
          disabled: false,
          start_date: 30.days.ago,
          end_date: 10.days.ago
        )
      end

      it 'returns false' do
        expect(license_manager.send(:common_checks?)).to be false
      end
    end

    context 'when license has not started' do
      before do
        license.update(
          disabled: false,
          start_date: 10.days.from_now,
          end_date: 20.days.from_now
        )
      end

      it 'returns false' do
        expect(license_manager.send(:common_checks?)).to be false
      end
    end

    context 'when license is project-specific but project_license is missing' do
      before do
        license.update(
          disabled: false,
          start_date: 10.days.ago,
          end_date: 10.days.from_now,
          is_project_specific: true
        )
      end

      it 'returns false' do
        expect(license_manager.send(:common_checks?)).to be false
      end
    end
  end

  describe '#find_project_specific_license' do
    context 'when license is not project-specific' do
      before do
        license.update(is_project_specific: false)
      end

      it 'returns nil' do
        expect(license_manager.send(:find_project_specific_license)).to be_nil
      end
    end

    context 'when license is project-specific' do
      let(:project_license) { create(:project_license, license: license, project: project) }

      before do
        license.update(is_project_specific: true)
        project_license
      end

      it 'finds and returns the project_license' do
        expect(license_manager.send(:find_project_specific_license)).to eq(project_license)
      end
    end

    context 'when license is project-specific but no project_license exists' do
      before do
        license.update(is_project_specific: true)
      end

      it 'returns nil' do
        expect(license_manager.send(:find_project_specific_license)).to be_nil
      end
    end
  end
end
