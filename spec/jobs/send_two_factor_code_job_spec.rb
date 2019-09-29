# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SendTwoFactorCodeJob, type: :job do
  describe '#perform' do
    it 'calls on the TwoFactorMailer' do
      user = build(:user)
      # allow(User).to receive(:find).and_return(user)
      allow(TwoFactorMailer).to receive_message_chain(:two_factor_code_email, :deliver_now)

      puts "described_class: #{described_class}"
      described_class.new.perform(user, '123456')

      expect(TwoFactorMailer).to have_received(:two_factor_code_email)
    end
  end

  describe '.perform_later' do
    xit 'adds the job to the queue :two_factor_codes' do
      user = create(:user)
      allow(TwoFactorMailer).to receive_message_chain(:two_factor_code_email, :deliver_now)

      described_class.perform_later(user, '123456')

      expect(two_factor_codes.last[:job]).to eq described_class
    end
  end
end
