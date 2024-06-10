# frozen_string_literal: true

require 'rails_helper'

module Sms
  module Verification
    RSpec.describe SendCode do
      let(:to_mobile_no) { '+919995323922' }
      let(:verification_service_sid) { 'SERVICE_SID' }
      let(:twilio_client) { instance_double(Twilio::REST::Client) }
      let(:verification) do
        instance_double(Twilio::REST::Verify::V2::ServiceContext::VerificationInstance, status: 'pending')
      end

      before do
        allow(Sms::TwilioClient).to receive(:get).and_return(twilio_client)
        allow(twilio_client).to receive_message_chain(:verify, :v2, :services, :verifications,
                                                      :create).and_return(verification)
      end

      describe '#call' do
        subject { described_class.new(to_mobile_no).call }

        context 'when the verification is successful' do
          it 'sends a verification message' do
            expected_response = VerificationResponse.new(
              error_message: nil,
              status: 'pending',
              to_mobile_no: to_mobile_no,
              verification_code: nil
            )

            expect { subject }.to broadcast(:ok, expected_response)
          end

          it 'calls the Twilio API with the correct parameters' do
            subject
            expect(twilio_client.verify.v2.services(verification_service_sid).verifications).
              to have_received(:create).with(to: to_mobile_no, locale: :en, channel: 'sms')
          end
        end

        context 'when the verification fails' do
          let(:error_message) { 'The verification failed' }
          let(:twilio_error) { Twilio::REST::RestError.new(error_message, Twilio::Response.new(400, '')) }

          before do
            allow(twilio_client).to receive_message_chain(:verify, :v2, :services, :verifications,
                                                          :create).and_raise(twilio_error)
          end

          it 'broadcasts an error' do
            expected_response = VerificationResponse.new(
              error_message: 'Verification failed. Please enter the correct OTP.',
              status: 'error',
              to_mobile_no: to_mobile_no,
              verification_code: nil
            )

            expect { subject }.to broadcast(:error, expected_response)
          end
        end
      end
    end
  end
end
