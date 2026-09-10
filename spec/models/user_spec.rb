# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
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

  describe '#root_domain_assessor?' do
    it 'is true for a global assessor with no assessor records and no client access' do
      global_assessor = create(:user, role: User::ADMIN_ROLE, global_assessor: true)

      expect(global_assessor.accessible_client_ids).to be_empty
      expect(global_assessor).to be_root_domain_assessor
    end

    it 'is false for an assessor whose membership was deleted but whose assessor records remain' do
      orphaned_assessor = create(:user, :assessor, global_assessor: true)
      orphaned_assessor.memberships.destroy_all

      expect(orphaned_assessor.accessible_client_ids).to be_empty
      expect(orphaned_assessor).not_to be_root_domain_assessor
    end

    it 'is false for an assessor who still holds a client assessor membership' do
      assessor = create(:user, :assessor)
      Membership.create!(user: assessor, client: assessor.assessors.first.campaign.project.client,
                         role: Membership::CLIENT_ASSESSOR_ROLE)

      expect(assessor).not_to be_root_domain_assessor
    end
  end

  describe '#timeout_in' do
    before do
      allow(Settings.features).to receive(:disable_session_timeout).and_return(false)
    end

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

  describe '#invite!' do
    let(:invited_by) { create(:superadmin) }
    let(:membership) { create(:membership) }

    before do
      allow(InvitationMailer).to receive(:link_to_client).and_return(double(deliver_later: true))
      allow(InvitationMailer).to receive(:invite_admin).and_return(double(deliver_later: true))
    end

    context 'when user is not an admin' do
      let(:regular_user) { create(:user) }

      it 'returns nil and does not send invitation' do
        result = regular_user.invite!(invited_by, membership)

        expect(result).to be_nil
        expect(InvitationMailer).not_to have_received(:link_to_client)
        expect(InvitationMailer).not_to have_received(:invite_admin)
      end
    end

    context 'when user is a superadmin' do
      let(:superadmin) { create(:superadmin) }

      context 'and user has already signed in before' do
        before do
          superadmin.update!(sign_in_count: 1, invitation_accepted_at: 1.day.ago)
        end

        it 'sends link to client email' do
          superadmin.invite!(invited_by, membership)

          expect(InvitationMailer).to have_received(:link_to_client).with(superadmin.id, membership)
        end
      end

      context 'and user has not signed in before' do
        before do
          superadmin.update!(sign_in_count: 0, invitation_token: nil, invitation_sent_at: nil)
        end

        it 'sends admin invitation email' do
          allow(superadmin).to receive(:generate_invitation_token!)

          superadmin.invite!(invited_by, membership)

          expect(InvitationMailer).to have_received(:invite_admin).with(superadmin.id, anything)
        end

        it 'skips devise invitation' do
          expect(superadmin).to receive(:skip_invitation=).with(true)
          superadmin.invite!(invited_by, membership)
        end
      end

      context 'and user is already invited to sign up' do
        before do
          superadmin.update!(invitation_token: 'some_token', invitation_sent_at: 1.hour.ago)
        end

        it 'returns nil and does not send any email' do
          result = superadmin.invite!(invited_by, membership)

          expect(result).to be_nil
          expect(InvitationMailer).not_to have_received(:link_to_client)
          expect(InvitationMailer).not_to have_received(:invite_admin)
        end
      end
    end

    context 'when user is a client admin' do
      let(:client_admin) { create(:client_admin) }

      before do
        client_admin.update!(sign_in_count: 0, invitation_token: nil, invitation_sent_at: nil)
      end

      it 'sends admin invitation email' do
        client_admin.invite!(invited_by, membership)

        expect(InvitationMailer).to have_received(:invite_admin).with(client_admin.id, anything)
      end
    end

    context 'when user is a project admin' do
      let(:project_admin) { create(:project_admin) }

      before do
        project_admin.update!(sign_in_count: 0, invitation_token: nil, invitation_sent_at: nil)
      end

      it 'sends admin invitation email' do
        project_admin.invite!(invited_by, membership)

        expect(InvitationMailer).to have_received(:invite_admin).with(project_admin.id, anything)
      end
    end

    context 'when user is a campaign admin' do
      let(:campaign_admin) { create(:campaign_admin) }

      before do
        campaign_admin.update!(sign_in_count: 0, invitation_token: nil, invitation_sent_at: nil)
      end

      it 'sends admin invitation email' do
        campaign_admin.invite!(invited_by, membership)

        expect(InvitationMailer).to have_received(:invite_admin).with(campaign_admin.id, anything)
      end
    end
  end

  describe '.not_application scope' do
    it 'excludes application users from results' do
      regular_admin = create(:client_admin)
      application_user = create(:application_user)

      results = User.not_application
      expect(results).to include(regular_admin)
      expect(results).not_to include(application_user)
    end
  end

  describe 'is_uat immutability' do
    it 'does not allow updates to is_uat after create' do
      user = create(:user, is_uat: false)

      expect(user.update(is_uat: true)).to eq(false)
      expect(user.errors[:is_uat]).to be_present
      expect(user.reload.is_uat).to eq(false)
    end
  end
end
