# frozen_string_literal: true

require 'rails_helper'

describe Sms::Verification::ConfirmCode do
  let(:to_mobile_no) { '+919995323922' }
  let(:verification_code) { '123777' }
  let(:context) { { params: { mobile_number: to_mobile_no, verification_code: verification_code } } }

  describe '#call' do
    subject { described_class.new(context).call }

    context 'when the verification is successful' do
      it 'returns a verification response with status approved' do
        verification_check = double('VerificationCheck', status: 'approved')
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(verification_check)

        expect { subject }.to broadcast(:ok)
      end
    end

    context 'when the verification is pending' do
      it 'retries until the verification is approved' do
        pending_verification_check = double('VerificationCheck', status: 'pending')

        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(pending_verification_check)

        expect { subject }.to raise_error Sms::Verification::ConfirmCodePendingError
      end
    end

    context 'when the verification failed' do
      it 'returns a verification response with error' do
        verification_check = double('VerificationCheck', status: 'failed')
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(verification_check)

        expect { subject }.to broadcast(:invalid)
      end
    end

    context 'when the verification max attepts reached' do
      it 'returns a verification response with error' do
        verification_check = double('VerificationCheck', status: 'max_attempts_reached')
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(verification_check)

        expect { subject }.to broadcast(:invalid)
      end
    end

    private

    def mobile_verification_token(mobile_number)
      JWT.encode({ data: mobile_number }, Rails.application.secrets.encrypted_key)
    end
  end
end
