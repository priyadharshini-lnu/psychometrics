# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::OccupationConditionSetPolicy do
  let(:superadmin) { create(:superadmin) }
  let(:user) { create(:user) }
  let(:dimension) { create(:dimension) }
  let(:occupation_condition_set) { create(:occupation_condition_set, dimension: dimension) }

  describe '#index?' do
    it 'allows superadmin' do
      policy = described_class.new(superadmin, occupation_condition_set, project_id: 1)
      expect(policy.index?).to be true
    end

    it 'allows user with view dimensions grant' do
      allow(user).to receive(:has_grant?).with(:dimensions, :view).and_return(true)
      policy = described_class.new(user, occupation_condition_set, project_id: 1)
      expect(policy.index?).to be true
    end

    it 'denies user without view dimensions grant' do
      allow(user).to receive(:has_grant?).with(:dimensions, :view).and_return(false)
      policy = described_class.new(user, occupation_condition_set, project_id: 1)
      expect(policy.index?).to be false
    end
  end

  describe '#create?' do
    it 'allows superadmin' do
      policy = described_class.new(superadmin, occupation_condition_set, project_id: 1)
      expect(policy.create?).to be true
    end

    it 'denies non-superadmin' do
      policy = described_class.new(user, occupation_condition_set, project_id: 1)
      expect(policy.create?).to be false
    end
  end

  describe '#edit?' do
    it 'allows superadmin' do
      policy = described_class.new(superadmin, occupation_condition_set, project_id: 1)
      expect(policy.edit?).to be true
    end

    it 'denies non-superadmin' do
      policy = described_class.new(user, occupation_condition_set, project_id: 1)
      expect(policy.edit?).to be false
    end
  end

  describe '#destroy?' do
    it 'allows superadmin' do
      policy = described_class.new(superadmin, occupation_condition_set, project_id: 1)
      expect(policy.destroy?).to be true
    end

    it 'denies non-superadmin' do
      policy = described_class.new(user, occupation_condition_set, project_id: 1)
      expect(policy.destroy?).to be false
    end
  end

  describe '#copy?' do
    it 'allows superadmin' do
      policy = described_class.new(superadmin, occupation_condition_set, project_id: 1)
      expect(policy.copy?).to be true
    end

    it 'denies non-superadmin' do
      policy = described_class.new(user, occupation_condition_set, project_id: 1)
      expect(policy.copy?).to be false
    end
  end
end
