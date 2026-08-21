# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Devise::TwoFactorAuthenticationController, type: :controller do
  let(:user) { create(:user) }
  let(:otp_code) { '123456' }

  before do
    sign_in user
    allow(user).to receive(:authenticate_otp).with(otp_code).and_return(true)
    allow(user).to receive(:authenticate_otp).with('invalid').and_return(false)
    allow(controller).to receive(:resource).and_return(user)

    # Mock SiemLogger to verify logging
    allow(SiemLogger).to receive(:log_security_event!)

    # Setup devise mapping
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  describe 'PUT #update' do
    context 'with valid OTP code' do
      it 'logs MFAAuthenticationSuccess event' do
        put :update, params: { code: otp_code }

        actor = SiemLogger.user_identifier(user.email, user.id)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'MFAAuthenticationSuccess',
          hash_including(
            context: "User: #{actor}",
            msg: "Two-factor authentication successful for #{actor}",
            authentication_channel: 'TwoFactor',
            actor_name: actor
          )
        )
      end

      it 'completes the two factor authentication' do
        put :update, params: { code: otp_code }

        expect(response).to redirect_to(:root)
        expect(flash[:notice]).to be_nil
      end
    end

    context 'with invalid OTP code' do
      before do
        allow(controller).to receive(:render)
      end

      it 'logs MFAAuthenticationFailure event' do
        put :update, params: { code: 'invalid' }

        actor = SiemLogger.user_identifier(user.email, user.id)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'MFAAuthenticationFailure',
          hash_including(
            context: "User: #{actor}",
            msg: "Two-factor authentication failed for #{actor}",
            authentication_channel: 'TwoFactor',
            actor_name: actor
          )
        )
      end
    end
  end
end
