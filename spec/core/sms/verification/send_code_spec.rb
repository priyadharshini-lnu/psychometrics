# frozen_string_literal: true

require 'rails_helper'

module Sms
  module Verification
    RSpec.describe SendCode do
      let(:project) { create(:project) }
      let(:to_mobile_no) { '+919995323922' }
      let(:verification_service_sid) { 'SERVICE_SID' }
      let(:twilio_client) { instance_double(Twilio::REST::Client) }
      let(:verification) do
        instance_double(Twilio::REST::Verify::V2::ServiceContext::VerificationInstance, status: 'pending')
      end

      let(:context) { { project: project, params: { mobile_number: to_mobile_no } } }

      before do
        allow(Sms::TwilioClient).to receive(:get).and_return(twilio_client)
        allow(twilio_client).to receive_message_chain(:verify, :v2, :services, :verifications,
                                                      :create).and_return(verification)
      end

      describe '#call' do
        subject { described_class.new(context).call }

        context 'when the verification is successful' do
          it 'sends a verification message' do
            expected_response = async_response('pending')

            expect { subject }.to broadcast(:ok, expected_response)
          end

          it 'calls the Twilio API with the correct parameters' do
            subject
            expect(twilio_client.verify.v2.services(verification_service_sid).verifications).
              to have_received(:create).with(to: to_mobile_no, locale: :en, channel: 'sms')
          end

          it 'logs audit log' do
            subject

            check_audit_log(outcome: 'successful', failure_reason: nil)
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
            expected_response = async_response('error', 'Something went wrong. Contact your administrator.')

            expect { subject }.to broadcast(:invalid, expected_response)

            check_audit_log(outcome: 'failed', failure_reason: '[HTTP 400] 400 : The verification failed')
          end
        end

        context 'when the number blocked' do
          let(:error_message) { 'The verification failed' }
          let(:twilio_error) { Twilio::REST::RestError.new(error_message, Twilio::Response.new(60_410, '')) }

          before do
            allow(twilio_client).to receive_message_chain(:verify, :v2, :services, :verifications,
                                                          :create).and_raise(twilio_error)
          end

          it 'broadcasts an error' do
            expected_response = async_response('error', 'This number is blocked due to too many attempts.')

            expect { subject }.to broadcast(:invalid, expected_response)

            check_audit_log(outcome: 'failed', failure_reason: '[HTTP 60410] 60410 : The verification failed')
          end
        end

        context 'when the number is wrong' do
          let(:error_message) { 'Invalid parameter `To`: +9665500000000' }
          let(:twilio_error) { Twilio::REST::RestError.new(error_message, Twilio::Response.new(60_200, '')) }

          before do
            allow(twilio_client).to receive_message_chain(:verify, :v2, :services, :verifications,
                                                          :create).and_raise(twilio_error)
          end

          it 'broadcasts an error' do
            expected_response = VerificationResponse.new(
              error_message: 'Mobile number is incorrect. Please recheck your number',
              status: 'error',
              to_mobile_no: to_mobile_no,
              verification_code: nil
            )

            expect { subject }.to broadcast(:error, expected_response)
          end
        end
      end

      private

      def async_response(status, error_message = nil)
        AsyncResponseRequest::AsyncResponse.new(
          processing_status: :completed,
          response_type: :json,
          response_data: VerificationResponse.new(
            error_message: error_message,
            status: status,
            to_mobile_no: to_mobile_no,
            verification_code: nil
          )
        )
      end

      def check_audit_log(params)
        audit_log = AuditLog.last

        expect(audit_log.user_id).to eq(nil)
        expect(audit_log.action).to eq('send_verification_code')
        expect(audit_log.project_id).to eq(project.id)
        expect(audit_log.payload).to include('mobile_number' => to_mobile_no)
        expect(audit_log.outcome).to eq(params[:outcome])
        expect(audit_log.failure_reason).to eq(params[:failure_reason])
      end
    end
  end
end
