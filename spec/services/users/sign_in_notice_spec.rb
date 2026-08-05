# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::SignInNotice do
  let(:session) { ActiveSupport::HashWithIndifferentAccess.new }

  describe '.capture' do
    it 'prefers the unsuccessful attempt and clears it' do
      attempted_at = 3.hours.ago.change(usec: 0)
      user = create(:superadmin, last_sign_in_at: 2.days.ago, last_unsuccessful_attempt: attempted_at)

      notice = described_class.capture(user)

      expect(notice).to eq('kind' => 'last_unsuccessful', 'at' => attempted_at.to_i)
      expect(user.reload.last_unsuccessful_attempt).to be_nil
    end

    it 'falls back to the previous sign-in' do
      signed_in_at = 2.days.ago.change(usec: 0)
      user = create(:superadmin, last_sign_in_at: signed_in_at)

      expect(described_class.capture(user)).to eq('kind' => 'last_sign_in', 'at' => signed_in_at.to_i)
    end

    it 'returns nothing for a user who has never signed in' do
      expect(described_class.capture(create(:superadmin, last_sign_in_at: nil))).to be_nil
    end
  end

  describe '.consume' do
    before { session[described_class::SESSION_KEY] = { 'kind' => 'last_sign_in', 'at' => 1_700_000_000 } }

    it 'returns the notice once and clears the marker' do
      expect(described_class.consume(session)).to eq(kind: 'last_sign_in', at: Time.zone.at(1_700_000_000))
      expect(described_class.consume(session)).to be_nil
    end

    it 'stays silent while impersonating' do
      session[:impersonated_by_id] = 1

      expect(described_class.consume(session)).to be_nil
      expect(session).not_to have_key(described_class::SESSION_KEY.to_s)
    end

    it 'stays silent while spoofing an end user' do
      session[:spoofed] = true

      expect(described_class.consume(session)).to be_nil
    end

    it 'ignores an unknown kind' do
      session[described_class::SESSION_KEY] = { 'kind' => 'nonsense', 'at' => 1_700_000_000 }

      expect(described_class.consume(session)).to be_nil
    end
  end

  describe '.flash_suffix' do
    it 'renders the matching devise sentence' do
      suffix = described_class.flash_suffix('kind' => 'last_sign_in', 'at' => 1_700_000_000)

      expect(suffix).to eq(
        I18n.t('devise.sessions.signed_in_time', date_time: I18n.l(Time.zone.at(1_700_000_000), format: :short))
      )
    end
  end
end
