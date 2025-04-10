# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  it { should have_many(:api_keys).inverse_of(:user) }
  it { should have_many(:user_assessments).inverse_of(:subject) }
  it { should have_many(:assessments).through(:user_assessments) }
  it { should have_many(:user_reports).inverse_of(:user) }

  describe '#send_two_factor_authentication_code' do
    it 'enqueues sending the two factor code' do
      allow(SendTwoFactorCodeJob).to receive(:perform_later)
      user = create(:user)

      user.send_two_factor_authentication_code('123456')

      expect(SendTwoFactorCodeJob).to have_received(:perform_later)
    end
  end

  describe '.with_access_to_campaign' do
    it 'returns only admins that have access to a campaign' do
      campaign = create(:campaign)
      super_admin = create(:superadmin)
      client_admin_without_access = create(:client_admin)
      project_admin_without_access = create(:project_admin)
      client_admin_with_access = create(:client_admin)
      create(:membership, client: campaign.client, user: client_admin_with_access, role: :client_admin)
      project_admin_with_access = create(:project_admin)
      create(:membership, client: campaign.project, user: project_admin_with_access)

      results = User.with_access_to_campaign(campaign.id)
      expect(results).to include(super_admin)
      expect(results).to include(client_admin_with_access)
      expect(results).to include(project_admin_with_access)
      expect(results).not_to include(client_admin_without_access)
      expect(results).not_to include(project_admin_without_access)
    end
  end

  describe '#generate_strong_password' do
    it 'generates a strong password for admins' do
      user = create(:client_admin)
      password = user.generate_strong_password
      user.password = password
      user.password_confirmation = password

      expect(password.length).to eql(12)
      expect(user.valid?).to eq(true)
    end

    it 'generates a strong password for regular users' do
      project = create(:project)
      project.security_setting.update(min_password_length: 16)
      user = create(:user, project: project)
      password = user.generate_strong_password
      user.password = password

      expect(password.length).to eq(16)
      expect(user.valid?).to eq(true)
    end
  end

  describe '#owner_ids' do
    let(:user) { create(:user) }

    it 'returns unique owner ids' do
      client_membership = create(:client_admin_membership, user: user)
      project_membership = create(:project_admin_membership, user: user)
      campaign_membership = create(:campaign_admin_membership, user: user)

      expected_owner_ids = [client_membership.client_id, project_membership.client_id,
                            campaign_membership.client_id].uniq

      expect(user.owner_ids).to match_array(expected_owner_ids)
    end
  end

  describe '#timeout_in' do
    it 'returns the default session timeout for admins' do
      super_admin = create(:superadmin)
      client_admin = create(:client_admin)
      project_admin = create(:project_admin)

      expect(super_admin.timeout_in).to eq(120.minutes)
      expect(client_admin.timeout_in).to eq(120.minutes)
      expect(project_admin.timeout_in).to eq(120.minutes)
    end

    it 'returns the configured timeout for normal user' do
      project = create(:project)
      project.security_setting.update(session_inactivity_timeout_in_seconds: 30.minutes.in_seconds)
      user = create(:user, project: project)

      expect(user.timeout_in).to eq(1800.seconds)
    end

    it 'returns the long timeout for anonymous users' do
      user = create(:user, is_anonym: true)

      expect(user.timeout_in).to eq(24.hours)
    end
  end

  describe '#saml_enforced_for_admins?' do
    let(:superadmin) { create(:superadmin) }
    let(:client_admin) { create(:client_admin, email: 'admin@mercer.com') }
    let(:project_admin) { create(:project_admin, email: 'user@mercer.com') }
    let(:regular_user) { create(:user, email: 'user@example.com', project: create(:project)) }

    before do
      allow(Settings.features).to receive(:disable_saml_for_admins).and_return(false)
      allow(Settings).to receive(:saml_enforced_email_domains).and_return(['mercer.com'])
    end

    it 'returns true for superadmin' do
      expect(superadmin.saml_enforced_for_admins?).to eq(true)
    end

    it 'returns true for client admin with SSO-enforced email domain' do
      expect(client_admin.saml_enforced_for_admins?).to eq(true)
    end

    it 'returns true for project admin with SSO-enforced email domain' do
      expect(project_admin.saml_enforced_for_admins?).to eq(true)
    end

    it 'returns false for regular user without SSO-enforced email domain' do
      expect(regular_user.saml_enforced_for_admins?).to eq(false)
    end

    it 'returns false for admin with non-SSO-enforced email domain' do
      client_admin.update!(email: 'admin@example.com')
      expect(client_admin.saml_enforced_for_admins?).to eq(false)
    end

    it 'returns false for non-admin user with SSO-enforced email domain' do
      regular_user.update!(email: 'regular_user@mercer.com')
      expect(regular_user.saml_enforced_for_admins?).to eq(false)
    end
  end
end
