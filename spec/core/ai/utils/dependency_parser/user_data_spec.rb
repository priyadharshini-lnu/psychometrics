# frozen_string_literal: true

require 'rails_helper'

describe AI::Utils::DependencyParser::UserData do
  let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }
  let(:user_profile) { create(:user_profile, user: user, locale: 'es') }
  let(:enable_masking_pii) { false }
  let(:custom_fields) { [] }
  let(:locale_param) { nil }

  subject do
    described_class.new(
      user,
      enable_masking_pii: enable_masking_pii,
      custom_fields: custom_fields,
      locale: locale_param
    )
  end

  describe '#parse' do
    context 'when locale is passed as parameter' do
      let(:locale_param) { 'fr' }

      before do
        allow(I18n).to receive(:t).with('languages.fr').and_return('French')
      end

      it 'uses the passed locale instead of user profile locale' do
        result = subject.parse

        expect(result).to include('<language locale="fr">French</language>')
        expect(result).not_to include('locale="es"')
      end

      it 'includes the correct locale in the XML output' do
        result = subject.parse

        expect(result).to match(%r{<language locale="fr">.*</language>})
        expect(result).to include('French')
      end
    end

    context 'when locale is not passed and user has profile with locale' do
      let(:locale_param) { nil }

      before do
        user.user_profile.update!(locale: 'es')

        allow(I18n).to receive(:t).and_call_original
        allow(I18n).to receive(:t).with('languages.es').and_return('Spanish')
      end

      it 'uses the user profile locale' do
        result = subject.parse

        expect(result).to include('<language locale="es">Spanish</language>')
      end

      it 'includes the correct locale from user profile in XML output' do
        result = subject.parse

        expect(result).to match(%r{<language locale="es">.*</language>})
        expect(result).to include('Spanish')
      end
    end

    context 'when locale is not passed and user has no profile locale' do
      let(:locale_param) { nil }
      let(:user_profile) { create(:user_profile, user: user, locale: nil) }

      before do
        # Mock the I18n translations and default locale
        allow(I18n).to receive(:default_locale).and_return(:en)
        allow(I18n).to receive(:t).and_call_original
        allow(I18n).to receive(:t).with('languages.en').and_return('English')
      end

      it 'uses the default locale' do
        result = subject.parse

        expect(result).to include('<language locale="en">English</language>')
      end

      it 'includes the default locale in XML output' do
        result = subject.parse

        expect(result).to match(%r{<language locale="en">.*</language>})
        expect(result).to include('English')
      end
    end
  end

  describe 'complete XML structure with locale' do
    let(:locale_param) { 'zh' }
    let(:user_profile_no_gender) { create(:user_profile, user: user, locale: 'es') }

    before do
      allow(I18n).to receive(:t).with('languages.zh').and_return('Chinese')
    end

    it 'includes locale in the complete user data XML structure' do
      result = subject.parse

      expected_structure = <<~XML.strip
        <subject id="#{user.id}">
        <name>John Doe</name>
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <gender></gender>
        <language locale="zh">Chinese</language>

        </subject>
      XML

      expect(result.strip).to eq(expected_structure)
    end
  end
end
