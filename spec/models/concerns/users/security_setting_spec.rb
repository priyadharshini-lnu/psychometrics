# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SecuritySetting, type: :model do
  let(:security_setting) { create(:security_setting) }
  let(:project) do
    create(
      :project,
      security_setting: security_setting,
      number: '12345',
      country: 'Barbados',
      year: Time.zone.now.year,
      project_manager: create(:superadmin)
    )
  end

  describe '#lock_access!' do
    let(:user) { create(:user) }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
    end

    it 'logs AccountLocked security event' do
      user.lock_access!

      expect(SiemLogger).to have_received(:log_security_event!).with(
        'AccountLocked',
        actor_name: user.id.to_s,
        context: "Account locked for #{user.id}",
        msg: "Account locked for #{user.id} due to too many failed login attempts",
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

  describe 'password validations' do
    it 'requires password when password is required' do
      user = build(:user, project: project, password: nil, password_confirmation: nil)

      user.valid?

      expect(user.errors.details[:password]).to include(error: :blank)
    end

    it 'validates password confirmation mismatch' do
      user = build(:user, project: project, password: 'Password@Strong@129', password_confirmation: 'Mismatch@123')

      user.valid?

      expect(user.errors.details[:password_confirmation]).to include(hash_including(error: :confirmation))
    end

    it 'validates repeated patterns when sequence restriction is enabled' do
      project.security_setting.update!(restrict_sequences: true)
      user = build(:user, project: project, password: 'aaaa1111!', password_confirmation: 'aaaa1111!')
      repeat_error = I18n.t('activemodel.errors.models.profile.attributes.password.contains_repeats')

      user.valid?

      expect(user.errors[:password]).to include(repeat_error)
    end
  end

  describe '#log_user_provision_event' do
    let(:creator) { create(:user, email: 'creator@example.com') }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = nil
      Current.application_component = nil
    end

    context 'when a new user is created by a creator' do
      it 'logs the UserProvision event with the creator as actor' do
        user = create(:user, project: project, creator: creator)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: creator.id.to_s,
          context: "User: #{user.id}",
          msg: "User account created for #{user.id}"
        )
      end
    end

    context 'when a new user is created without an explicit creator but Current.user is set' do
      before { Current.user = creator }

      it 'logs the UserProvision event with Current.user as actor' do
        user = create(:user, project: project, creator: nil)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: creator.id.to_s,
          context: "User: #{user.id}",
          msg: "User account created for #{user.id}"
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
          actor_name: other_user.id.to_s, # Should be Current.user, not creator
          context: "User: #{user.id}",
          msg: "User account created for #{user.id}"
        )
      end
    end

    context 'when a new user is created by system (no creator, no Current.user)' do
      it 'logs the UserProvision event with System as actor' do
        user = create(:user, project: project, creator: nil)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserProvision',
          actor_name: 'System',
          context: "User: #{user.id}",
          msg: "User account created for #{user.id}"
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
          context: "User: #{user.id}",
          msg: "User account created for #{user.id}"
        )
      end
    end
  end

  describe '#log_user_deprovision_event' do
    let(:modifier) { create(:user, email: 'modifier@example.com') }
    let!(:user) { create(:user, project: project) }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = nil
    end

    describe 'User Deletion' do
      context 'when a user is deleted by a modifier (no Current.user)' do
        before { user.update_column(:modified_by_id, modifier.id) }

        it 'logs the UserDeprovision event with the modifier as actor' do
          user.destroy

          expect(SiemLogger).to have_received(:log_security_event!).with(
            'UserDeprovision',
            actor_name: modifier.id.to_s,
            context: "User: #{user.id}",
            msg: "User account deleted for #{user.id}"
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
            actor_name: other_user.id.to_s,
            context: "User: #{user.id}",
            msg: "User account deleted for #{user.id}"
          )
        end
      end
    end
  end

  describe '#log_security_context_change' do
    let(:user) { create(:user, role: 'Users::Regular') }
    let(:modifier) { create(:user, email: 'modifier@example.com') }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = modifier
    end

    context 'when role is changed' do
      it 'logs UserSecurityContextChange event' do
        user.update(role: 'Users::Admin')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "Security context changed for #{user.id}. Role changed from Users::Regular to Users::Admin"
        )
      end
    end

    context 'when grants are changed' do
      it 'logs UserSecurityContextChange event' do
        user.update(grants: { 'projects' => ['view'] })

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "Security context changed for #{user.id}. Grants modified"
        )
      end
    end
  end

  describe '#log_alter_user_event' do
    let(:user) { create(:user) }
    let(:modifier) { create(:user, email: 'modifier@example.com') }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = modifier
    end

    context 'when user changes first_name' do
      it 'logs AlterUser event' do
        user.update(first_name: 'NewName')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. First name changed"
        )
      end
    end

    context 'when user changes email' do
      it 'logs AlterUser event' do
        user.update(email: 'newemail@example.com')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. Email changed"
        )
      end
    end

    context 'when account is disabled' do
      it 'logs AlterUser event' do
        user.update(disabled: true)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. Disabled changed from 'false' to 'true'"
        )
      end
    end

    context 'when 2FA is enabled' do
      it 'logs AlterUser event' do
        user.update(enable_2fa: false) # Default is true via DB column default

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. Enable 2fa changed from 'true' to 'false'"
        )
      end
    end

    context 'when force_password_change is set' do
      it 'logs AlterUser event' do
        user.update(force_password_change: true)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. Force password change changed from 'false' to 'true'"
        )
      end
    end

    context 'when global_assessor is set' do
      it 'logs AlterUser event' do
        user.update(global_assessor: true)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. Global assessor changed from 'false' to 'true'"
        )
      end
    end

    context 'when account is unlocked' do
      before do
        user.update_columns(unlock_token: 'token', locked_at: Time.current)
      end

      it 'logs AlterUser event when unlock_token is cleared' do
        user.update(unlock_token: nil, locked_at: nil)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "User account changed for #{user.id}. Account unlocked"
        )
      end
    end

    context 'when multiple attributes change' do
      it 'logs all changes in one event' do
        user.update(first_name: 'Jane', disabled: true)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'AlterUser',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: match(/First name changed.*Disabled changed/)
        )
      end
    end

    context 'when unrelated attribute changes' do
      it 'does not log AlterUser event' do
        user.update(sign_in_count: user.sign_in_count + 1)
        expect(SiemLogger).not_to have_received(:log_security_event!).with('AlterUser', any_args)
      end
    end
  end

  describe '#log_password_change_event' do
    let(:user) { create(:user) }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = nil
    end

    context 'when user changes their own password' do
      before { Current.user = user }

      it 'logs PasswordChange event with user as actor' do
        user.update(password: 'NewStrongP@ss2026!')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'PasswordChange',
          actor_name: user.id.to_s,
          context: "User: #{user.id}",
          msg: "Password changed for #{user.id}"
        )
      end
    end

    context 'when admin changes user password' do
      let(:admin) { create(:superadmin) }
      before { Current.user = admin }

      it 'logs PasswordChange event with admin as actor' do
        user.update(password: 'NewStrongP@ss2026!')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'PasswordChange',
          actor_name: admin.id.to_s,
          context: "User: #{user.id}",
          msg: "Password changed for #{user.id}"
        )
      end
    end

    context 'when password is changed with a modifier set (no Current.user)' do
      let(:modifier) { create(:user) }
      before { user.update_columns(modified_by_id: modifier.id) }

      it 'logs PasswordChange event with modifier as actor' do
        user.update(password: 'NewStrongP@ss2026!')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'PasswordChange',
          actor_name: modifier.id.to_s,
          context: "User: #{user.id}",
          msg: "Password changed for #{user.id}"
        )
      end
    end

    context 'when password is changed by system (no Current.user, no modifier)' do
      it 'logs PasswordChange event with System as actor' do
        user.update(password: 'NewStrongP@ss2026!')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'PasswordChange',
          actor_name: 'System',
          context: "User: #{user.id}",
          msg: "Password changed for #{user.id}"
        )
      end
    end

    context 'when unrelated attribute changes' do
      it 'does not log PasswordChange event' do
        user.update(first_name: 'NewName')
        expect(SiemLogger).not_to have_received(:log_security_event!).with('PasswordChange', any_args)
      end
    end

    context 'when DONT_SEND_PI_TO_SIEM is false' do
      before do
        allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(false)
        Current.user = user
      end

      it 'logs with email in context/msg' do
        allow(SiemLogger).to receive(:user_identifier).and_call_original

        user.update(password: 'NewStrongP@ss2026!')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'PasswordChange',
          actor_name: user.email, # user_identifier likely returns email when PII allowed
          context: "User: #{user.email}",
          msg: "Password changed for #{user.email}"
        )
      end
    end

    context 'when SIEM logger raises an error' do
      before do
        allow(SiemLogger).to receive(:log_security_event!).and_raise(StandardError.new('SIEM Error'))
        allow(Rails.logger).to receive(:error)
        user.update(password: 'NewStrongP@ss2026!')
      end

      it 'logs the error to Rails logger and does not crash' do
        expect(Rails.logger).to have_received(:error).with(/Failed to log PasswordChange event: SIEM Error/)
      end
    end

    context 'when password and other attributes change simultaneously' do
      before { Current.user = user }

      it 'logs both PasswordChange and AlterUser events' do
        user.update(password: 'NewStrongP@ss2026!', first_name: 'NewName')

        expect(SiemLogger).to have_received(:log_security_event!).with('PasswordChange', any_args)
        expect(SiemLogger).to have_received(:log_security_event!).with('AlterUser', any_args)
      end
    end
  end
end
