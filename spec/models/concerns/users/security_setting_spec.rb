# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SecuritySetting, type: :model do
  before do
    allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(false)
  end

  describe '#lock_access!' do
    let(:user) { create(:user) }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
    end

    it 'logs AccountLocked security event' do
      user.lock_access!

      expect(SiemLogger).to have_received(:log_security_event!).with(
        'AccountLocked',
        actor_name: user.email,
        context: "Account locked for #{user.email}",
        msg: "Account locked for #{user.email} due to too many failed login attempts",
        authentication_channel: 'Password Login'
      )
    end

    it 'still locks the user' do
      expect { user.lock_access! }.to change { user.reload.locked_at }.from(nil)
    end

    context 'when DONT_SEND_PI_TO_SIEM is true' do
      before do
        allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      end

      it 'logs AccountLocked security event with redacted PII' do
        user.lock_access!

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AccountLocked',
          actor_name: user.id.to_s,
          context: "Account locked for #{user.id}",
          msg: "Account locked for #{user.id} due to too many failed login attempts",
          authentication_channel: 'Password Login'
        )
      end
    end
  end

  describe '#log_user_provision_event' do
    let(:security_setting) { create(:security_setting) }
    let(:project) { create(:project, security_setting: security_setting) }
    let(:creator) { create(:user, email: 'creator@example.com') }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      Current.user = nil
      Current.application_component = nil
    end

    context 'when a new user is created by a creator' do
      it 'logs the UserProvision event with the creator as actor' do
        user = create(:user, project: project, creator: creator)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: 'creator@example.com',
          context: "User: #{user.email}",
          msg: "User account created for #{user.email}"
        )
      end
    end

    context 'when a new user is created without an explicit creator but Current.user is set' do
      before { Current.user = creator }

      it 'logs the UserProvision event with Current.user as actor' do
        user = create(:user, project: project, creator: nil)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: 'creator@example.com',
          context: "User: #{user.email}",
          msg: "User account created for #{user.email}"
        )
      end
    end

    context 'when both creator and Current.user are set' do
      let(:other_user) { create(:user, email: 'other@example.com') }
      before { Current.user = other_user }

      it 'prioritizes Current.user as the actor' do
        user = create(:user, project: project, creator: creator)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: 'other@example.com', # Should be Current.user, not creator
          context: "User: #{user.email}",
          msg: "User account created for #{user.email}"
        )
      end
    end

    context 'when a new user is created by system (no creator, no Current.user)' do
      it 'logs the UserProvision event with System as actor' do
        user = create(:user, project: project, creator: nil)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: 'System',
          context: "User: #{user.email}",
          msg: "User account created for #{user.email}"
        )
      end
    end

    context 'when Current.application_component is set' do
      before { Current.application_component = 'BatchImport' }

      it 'logs the UserProvision event with the correct context' do
        user = create(:user, project: project, creator: nil)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: 'System',
          context: "User: #{user.email}",
          msg: "User account created for #{user.email}"
        )
      end
    end
  end

  describe '#log_user_deprovision_event' do
    let(:security_setting) { create(:security_setting) }
    let(:project) { create(:project, security_setting: security_setting) }
    let(:modifier) { create(:user, email: 'modifier@example.com') }
    let!(:user) { create(:user, project: project) }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      Current.user = nil
    end

    describe 'User Deletion' do
      context 'when a user is deleted by a modifier (no Current.user)' do
        before { user.update_column(:modified_by_id, modifier.id) }

        it 'logs the UserDeprovision event with the modifier as actor' do
          user.destroy

          expect(SiemLogger).to have_received(:log_security_event!).with(
            'UserDeprovision',
            actor_name: 'modifier@example.com',
            context: "User: #{user.email}",
            msg: "User account deleted for #{user.email}"
          )
        end
      end

      context 'when a user is deleted with Current.user set (Current.user prioritized)' do
        let(:other_user) { create(:user, email: 'other@example.com') }
        before do
          user.update_column(:modified_by_id, modifier.id)
          Current.user = other_user
        end

        it 'logs the UserDeprovision event with Current.user as actor' do
          user.destroy

          expect(SiemLogger).to have_received(:log_security_event!).with(
            'UserDeprovision',
            actor_name: 'other@example.com',
            context: "User: #{user.email}",
            msg: "User account deleted for #{user.email}"
          )
        end
      end
    end
  end
end
