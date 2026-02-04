# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LicenseUsage, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:license).inverse_of(:license_usages) }
    it { is_expected.to belong_to(:client).inverse_of(:license_usages) }
    it { is_expected.to belong_to(:campaign).inverse_of(:license_usages) }
    it { is_expected.to belong_to(:user).inverse_of(:license_usages) }
    it { is_expected.to belong_to(:registration_code).inverse_of(:license_usages) }
    it { is_expected.to belong_to(:consumer) }

    it { is_expected.to belong_to(:project).class_name('Client').optional }
    it { is_expected.to belong_to(:project_license).optional }
    it { is_expected.to belong_to(:status_updated_by).class_name('User') }
  end

  describe 'enum scopes' do
    let!(:active_usage)   { create(:license_usage, status: :active) }
    let!(:inactive_usage) { create(:license_usage, status: :inactive) }

    it 'returns active records' do
      expect(described_class.active).to contain_exactly(active_usage)
    end

    it 'returns inactive records' do
      expect(described_class.inactive).to contain_exactly(inactive_usage)
    end
  end
end
