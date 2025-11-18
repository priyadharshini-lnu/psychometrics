# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DevelopmentAction, type: :model do
  describe 'translation fallback functionality' do
    let(:development_action) { create(:development_action) }

    describe '#name' do
      context 'when translation exists for current locale' do
        it 'returns the translation for the current locale' do
          I18n.with_locale(:en) do
            development_action.update!(name: 'English Name')
            expect(development_action.name).to eq('English Name')
          end
        end
      end

      context 'when translation does not exist for current locale' do
        it 'falls back to first available translation' do
          I18n.with_locale(:ar) do
            development_action.update!(name: 'Arabic Name')
          end

          # Switch to English locale (no English translation exists)
          I18n.with_locale(:en) do
            expect(development_action.name).to eq('Arabic Name')
          end
        end
      end
    end

    describe '#description' do
      context 'when translation exists for current locale' do
        it 'returns the translation for the current locale' do
          I18n.with_locale(:en) do
            development_action.update!(description: 'English Description')
            expect(development_action.description).to eq('English Description')
          end
        end
      end

      context 'when translation does not exist for current locale' do
        it 'falls back to first available translation' do
          I18n.with_locale(:ar) do
            development_action.update!(description: 'Arabic Description')
          end

          # Switch to English locale (no English translation exists)
          I18n.with_locale(:en) do
            expect(development_action.description).to eq('Arabic Description')
          end
        end
      end
    end
  end
end
