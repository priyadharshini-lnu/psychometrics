# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectLicense, type: :model do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:license) { create(:license, client: client) }

  describe 'associations' do
    it { is_expected.to belong_to(:project) }
    it { is_expected.to belong_to(:license) }
  end

  describe 'validations' do
    subject { create(:project_license, project: project, license: license) }
    it { is_expected.to validate_numericality_of(:used_number).is_greater_than_or_equal_to(0) }
  end

  describe 'scopes' do
    let!(:enabled_license) { create(:project_license, project: project, license: license, enabled: true) }
    let!(:disabled_license) do
      create(:project_license, project: project, license: create(:license, client: client), enabled: false)
    end

    it 'returns enabled licenses' do
      expect(described_class.enabled).to include(enabled_license)
      expect(described_class.enabled).not_to include(disabled_license)
    end

    it 'returns disabled licenses' do
      expect(described_class.disabled).to include(disabled_license)
      expect(described_class.disabled).not_to include(enabled_license)
    end
  end

  describe '#enough_licenses?' do
    context 'when usage_limit is greater than used_number' do
      subject do
        create(:project_license, project: project, license: license, usage_limit: 10, used_number: 5).enough_licenses?
      end
      it { is_expected.to be true }
    end

    context 'when usage_limit is equal to used_number' do
      subject do
        create(:project_license, project: project, license: license, usage_limit: 10, used_number: 10).enough_licenses?
      end
      it { is_expected.to be false }
    end

    context 'when usage_limit is less than used_number' do
      subject do
        create(:project_license, project: project, license: license, usage_limit: 5, used_number: 10).enough_licenses?
      end
      it { is_expected.to be false }
    end
  end

  describe '#enough_license_credits?' do
    let(:project_license) do
      create(:project_license, project: project, license: license, usage_limit: 10, used_number: 5)
    end

    context 'when remaining credits are greater than or equal to requested credit' do
      it 'returns true with exact remaining credits' do
        expect(project_license.enough_license_credits?(5)).to be true
      end

      it 'returns true with less than remaining credits' do
        expect(project_license.enough_license_credits?(3)).to be true
      end
    end

    context 'when remaining credits are less than requested credit' do
      it 'returns false' do
        expect(project_license.enough_license_credits?(6)).to be false
      end
    end

    context 'when no credits are remaining' do
      let(:project_license_no_credits) do
        create(:project_license, project: project, license: license, usage_limit: 10, used_number: 10)
      end

      it 'returns false' do
        expect(project_license_no_credits.enough_license_credits?(1)).to be false
      end
    end

    context 'when requested credit is zero' do
      it 'returns true' do
        expect(project_license.enough_license_credits?(0)).to be true
      end
    end
  end
end
