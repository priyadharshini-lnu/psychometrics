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
end
