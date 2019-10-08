# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SendTwoFactorCodeJob, type: :job do
  describe '#perform' do
    it 'calls on the TwoFactorMailer' do
      user = build(:user)
      allow(TwoFactorMailer).to receive_message_chain(:two_factor_code_email, :deliver_now)

      described_class.new.perform(user, '123456')

      expect(TwoFactorMailer).to have_received(:two_factor_code_email)
    end
  end
end
