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
end
