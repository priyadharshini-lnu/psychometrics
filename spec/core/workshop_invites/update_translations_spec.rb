# frozen_string_literal: true

require 'rails_helper'

describe WorkshopInvites::UpdateTranslations do
  let!(:workshop_invite) { create(:workshop_invite) }

  before do
    WorkshopInvites::CreateTranslations.call!(workshop_invite, [
      { locale: :en, title: 'en_title', description: 'en_description' },
      { locale: :ar, title: 'ar_title', description: 'ar_description' },
      { locale: :es, title: 'es_title', description: 'es_description' }
    ])
  end

  describe '.call' do
    it 'removes translations that are no longer present' do
      # Update with only English and Arabic (removing Spanish)
      data = [
        { locale: :en, title: 'updated_en_title', description: 'updated_en_description' },
        { locale: :ar, title: 'updated_ar_title', description: 'updated_ar_description' }
      ]

      described_class.call!(workshop_invite, data)
      expect(workshop_invite.translations.where(locale: :es)).to be_empty

      expect(workshop_invite.reload.title).to eq('updated_en_title')
      expect(workshop_invite.reload.description).to eq('updated_en_description')

      Mobility.with_locale(:ar) do
        expect(workshop_invite.reload.title).to eq('updated_ar_title')
        expect(workshop_invite.reload.description).to eq('updated_ar_description')
      end
    end

    it 'handles empty translations array by removing all translations' do
      described_class.call!(workshop_invite, [])

      expect(workshop_invite.translations.count).to eq(0)
    end

    it 'adds new translations while keeping existing ones' do
      data = [
        { locale: :en, title: 'updated_en_title', description: 'updated_en_description' },
        { locale: :ar, title: 'updated_ar_title', description: 'updated_ar_description' },
        { locale: :fr, title: 'fr_title', description: 'fr_description' }
      ]

      described_class.call!(workshop_invite, data)

      # Check that French translation was added
      Mobility.with_locale(:fr) do
        expect(workshop_invite.reload.title).to eq('fr_title')
        expect(workshop_invite.reload.description).to eq('fr_description')
      end

      # Check that Spanish was removed
      expect(workshop_invite.translations.where(locale: :es)).to be_empty
    end
  end
end
