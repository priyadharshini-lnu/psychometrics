# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminAuth::SamlRedirectGuard do
  describe '.for_user' do
    let(:user) { create(:user) }

    context 'when disable_saml_for_admins feature flag is on' do
      before { allow(Settings.features).to receive(:disable_saml_for_admins).and_return(true) }

      it 'returns required: false without checking the user' do
        expect(described_class.for_user(user: user).required).to be false
      end
    end

    context 'when disable_saml_for_admins is off' do
      before { allow(Settings.features).to receive(:disable_saml_for_admins).and_return(false) }

      context 'when user is nil' do
        it 'returns required: false' do
          expect(described_class.for_user(user: nil).required).to be false
        end
      end

      context 'when user does not have SAML enforced' do
        before { allow(user).to receive(:saml_enforced_for_admins?).and_return(false) }

        it 'returns required: false' do
          expect(described_class.for_user(user: user).required).to be false
        end
      end

      context 'when user has SAML enforced' do
        before { allow(user).to receive(:saml_enforced_for_admins?).and_return(true) }

        it 'returns required: true' do
          expect(described_class.for_user(user: user).required).to be true
        end

        it 'returns a token' do
          expect(described_class.for_user(user: user).token).to be_present
        end

        it 'encodes return_url into the token when provided' do
          result = described_class.for_user(user: user, return_url: '/admin/dashboard')
          decoded = AdminAuth::SamlIntentToken.decode(result.token)

          expect(decoded.return_url).to eq('/admin/dashboard')
        end

        it 'encodes no return_url when not provided' do
          result = described_class.for_user(user: user)
          decoded = AdminAuth::SamlIntentToken.decode(result.token)

          expect(decoded.return_url).to be_nil
        end
      end
    end
  end
end
