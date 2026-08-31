# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationEmailMailer do
  # NOTE: CommunicationEmail#redeliver! (after_commit on: :create) enqueues the real mailer job.
  # Stubbed here to isolate the mailer/render-content behaviour under test from that side effect.
  before { allow_any_instance_of(CommunicationEmail).to receive(:redeliver!) }

  describe '#create' do
    let(:user) { create(:user, :with_project_membership) }
    let(:campaign) { create(:campaign) }
    let(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }
    let(:communication) { create(:communication) }
    let(:communication_email) do
      create(:communication_email, user: user, campaign_user: campaign_user, communication: communication)
    end

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
    let(:campaign) { create(:campaign) }
    let(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }
    let(:communication) { create(:communication) }
    let(:communication_email) do
      create(:communication_email, user: user, campaign_user: campaign_user, communication: communication)
    end

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

  describe 'status tracking' do
    let(:user) { create(:user, :with_project_membership) }
    let(:campaign) { create(:campaign) }
    let(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }
    let(:communication) { create(:communication) }
    let(:communication_email) do
      create(:communication_email, user: user, campaign_user: campaign_user, communication: communication)
    end

    before do
      Mobility.with_locale(:en) { communication.update!(subject: 'Hello', body: 'Welcome') }
    end

    it 'marks the email sent and increments attempts on success' do
      # Mailer actions are lazily evaluated by ActionMailer -- accessing .message forces the
      # `create` method body (and its status bookkeeping) to actually run.
      described_class.create(communication_email.id).message

      communication_email.reload
      expect(communication_email.status).to eq('sent')
      expect(communication_email.attempts).to eq(1)
      expect(communication_email.sent_at).to be_present
    end

    it 'marks the email failed and records the error without swallowing the exception' do
      allow_any_instance_of(described_class).to receive(:send_configured_email).and_raise(StandardError, 'smtp down')

      expect { described_class.create(communication_email.id).message }.to raise_error(StandardError, 'smtp down')

      communication_email.reload
      expect(communication_email.status).to eq('failed')
      expect(communication_email.error_code).to eq('StandardError')
      expect(communication_email.error_message).to eq('smtp down')
      expect(communication_email.attempts).to eq(1)
    end
  end

  describe '#create with a CommunicationDelivery-sourced email' do
    let(:user) { create(:user, :with_project_membership) }
    let(:communication_delivery) do
      create(:communication_delivery, subject: 'Delivery subject', body: '<p>Delivery body</p>')
    end
    let(:campaign_user) { create(:campaign_user, user: user, campaign: communication_delivery.campaign) }
    let(:communication_email) do
      create(:communication_email, communication: nil, communication_delivery: communication_delivery,
                                    user: user, campaign_user: campaign_user)
    end

    it 'renders without raising' do
      expect { described_class.create(communication_email.id) }.not_to raise_error
    end

    it 'uses the delivery\'s plain subject and body' do
      mail = described_class.create(communication_email.id)
      expect(mail.subject).to eq('Delivery subject')
      expect(mail.body.encoded).to include('Delivery body')
    end

    it 'sends no cc emails' do
      mail = described_class.create(communication_email.id)
      expect(mail.cc).to be_blank
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
