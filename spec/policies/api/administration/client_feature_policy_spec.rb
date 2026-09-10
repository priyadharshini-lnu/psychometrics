# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::ClientFeaturePolicy, '#migrate_communication_center?' do
  let(:support_email) { 'support-admin@example.com' }

  def policy_for(user)
    described_class.new(user, nil)
  end

  context 'when the user is a support admin (superadmin on the allowlist)' do
    let(:user) { create(:superadmin, email: support_email) }

    before do
      allow(Settings).to receive(:support_admins).and_return(support_email)
    end

    it 'returns true' do
      expect(policy_for(user).migrate_communication_center?).to eq(true)
    end
  end

  context 'when the user is a superadmin but NOT on the support-admin allowlist' do
    let(:user) { create(:superadmin, email: 'regular-superadmin@example.com') }

    before do
      allow(Settings).to receive(:support_admins).and_return(support_email)
    end

    it 'returns false' do
      expect(policy_for(user).migrate_communication_center?).to eq(false)
    end
  end

  context 'when the user is a client admin' do
    let(:user) { create(:client_admin) }

    before do
      allow(Settings).to receive(:support_admins).and_return(support_email)
    end

    it 'returns false' do
      expect(policy_for(user).migrate_communication_center?).to eq(false)
    end
  end

  context 'when the user is a project admin' do
    let(:user) { create(:project_admin) }

    before do
      allow(Settings).to receive(:support_admins).and_return(support_email)
    end

    it 'returns false' do
      expect(policy_for(user).migrate_communication_center?).to eq(false)
    end
  end

  context 'when the support_admins setting is blank' do
    let(:user) { create(:superadmin, email: support_email) }

    before do
      allow(Settings).to receive(:support_admins).and_return(nil)
    end

    it 'returns false even for a superadmin' do
      expect(policy_for(user).migrate_communication_center?).to eq(false)
    end
  end
end
