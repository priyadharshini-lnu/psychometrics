# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationEmailMailer do
  describe '#create' do
    let(:user) { create(:user, :with_project_membership) }
    let(:communication) { create(:communication) }
    let(:communication_email) { create(:communication_email, user: user, communication: communication) }

    before do
      # Set the user's locale through user_profile
      user.user_profile.update!(locale: 'es')

      Mobility.with_locale(:en) do
        communication.update!(subject: 'Hello', body: 'Welcome')
      end
      Mobility.with_locale(:es) do
        communication.update!(subject: 'Hola', body: 'Bienvenido')
      end
    end

    it 'uses the user\'s preferred locale' do
      mail = described_class.create(communication_email.id)
      expect(mail.subject).to include('Hola')
      expect(mail.body.encoded).to include('Bienvenido')
    end
  end

  describe 'RTL logic' do
    let(:user) { create(:user, :with_project_membership) }
    let(:communication) { create(:communication) }
    let(:communication_email) { create(:communication_email, user: user, communication: communication) }

    context 'when user locale is Arabic but template is not' do
      before do
        user.user_profile.update!(locale: 'ar')
        Mobility.with_locale(:en) do
          communication.update!(subject: 'Hello', body: '<p>Welcome</p>')
        end
      end

      it 'does not apply RTL styling' do
        mail = described_class.create(communication_email.id)
        expect(mail.body.encoded).not_to include('dir="rtl"')
      end
    end

    context 'when communication template is Arabic but user locale is not' do
      before do
        user.user_profile.update!(locale: 'en')
        Mobility.with_locale(:ar) do
          communication.update!(subject: 'مرحبا', body: '<p>أهلا وسهلا</p>')
        end
      end

      it 'does not apply RTL styling' do
        mail = described_class.create(communication_email.id)
        expect(mail.body.encoded).not_to include('dir="rtl"')
      end
    end

    context 'when both user locale and template are Arabic' do
      before do
        user.user_profile.update!(locale: 'ar')
        Mobility.with_locale(:ar) do
          communication.update!(subject: 'مرحبا', body: '<p>أهلا وسهلا</p>')
        end
      end

      it 'applies RTL styling' do
        mail = described_class.create(communication_email.id)
        expect(mail.body.encoded).to include('dir="rtl"')
      end
    end

    context 'when neither user locale nor template is Arabic' do
      before do
        user.user_profile.update!(locale: 'en')
        Mobility.with_locale(:en) do
          communication.update!(subject: 'Hello', body: '<p>Welcome</p>')
        end
      end

      it 'does not apply RTL styling' do
        mail = described_class.create(communication_email.id)
        expect(mail.body.encoded).not_to include('dir="rtl"')
      end
    end
  end
end
