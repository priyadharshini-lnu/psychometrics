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

  describe 'translated campaign name in piped text' do
    let(:project) { create(:project, subdomain: 'test-project') }
    let(:user) { create(:user, project: project) }
    let(:campaign) do
      campaign = create(:campaign, name: 'English Campaign Name', project: project)
      Mobility.with_locale(:ar) { campaign.update!(name: 'Arabic Campaign Name') }
      campaign
    end
    let(:communication) do
      create(:communication, body: 'Campaign: ${c://Campaign/Field}')
    end
    let(:communication_email) do
      create(:communication_email, user: user, communication: communication)
    end

    before { communication.update!(project_campaign: campaign) }

    context 'when the participant locale is English' do
      before { user.user_profile.update!(locale: 'en') }

      it 'renders the translated campaign name in the participant locale' do
        mail = described_class.create(communication_email.id)
        expect(mail.body.encoded).to include('English Campaign Name')
        expect(mail.body.encoded).not_to include('Arabic Campaign Name')
      end
    end

    context 'when the participant locale is Arabic' do
      before { user.user_profile.update!(locale: 'ar') }

      it 'renders the translated campaign name in the participant locale' do
        mail = described_class.create(communication_email.id)
        expect(mail.body.encoded).to include('Arabic Campaign Name')
        expect(mail.body.encoded).not_to include('English Campaign Name')
      end
    end
  end
end
