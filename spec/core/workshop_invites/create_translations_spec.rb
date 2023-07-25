# frozen_string_literal: true

require 'rails_helper'

describe WorkshopInvites::CreateTranslations do
  let!(:workshop_invite) { create(:workshop_invite) }

  describe '.call' do
    it 'assessment_started' do
      data = [
        { locale: :en, title: 'en_title', description: 'en_description' },
        { locale: :ar, title: 'ar_title', description: 'ar_description' }
      ]

      described_class.call!(workshop_invite, data)
      expect(workshop_invite.reload.title).to eq('en_title')
      expect(workshop_invite.reload.description).to eq('en_description')

      Mobility.with_locale(:ar) do
        expect(workshop_invite.reload.title).to eq('ar_title')
        expect(workshop_invite.reload.description).to eq('ar_description')
      end
    end
  end
end
