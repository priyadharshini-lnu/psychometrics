# frozen_string_literal: true

require 'rails_helper'

describe Sms::Verification::ConfirmCode do
  let(:project) { create(:project) }
  let(:to_mobile_no) { '+919995323922' }
  let(:verification_code) { '123777' }
  let(:context) { { project: project, params: { mobile_number: to_mobile_no, verification_code: verification_code } } }

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

      it 'logs audit log' do
        verification_check = double('VerificationCheck', status: 'approved')
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(verification_check)

        subject

        check_audit_log(code_type: 'verification_code', code: verification_code, outcome: 'successful',
                        failure_reason: nil)
      end
    end

    context 'when the verification failed' do
      it 'returns a verification response with error' do
        verification_check = double('VerificationCheck', status: 'failed')
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(verification_check)

        expect { subject }.to broadcast(:invalid)

        check_audit_log(code_type: 'verification_code', code: verification_code, outcome: 'failed',
                        failure_reason: 'failed')
      end
    end

    context 'when the verification max attepts reached' do
      it 'returns a verification response with error' do
        verification_check = double('VerificationCheck', status: 'max_attempts_reached')
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_return(verification_check)

        expect { subject }.to broadcast(:invalid)

        check_audit_log(code_type: 'verification_code', code: verification_code, outcome: 'failed',
                        failure_reason: 'max_attempts_reached')
      end
    end

    context 'when raised Twilio::REST::RestError' do
      let(:twilio_error) { Twilio::REST::RestError.new('', Twilio::Response.new(400, '')) }

      it 'returns a verification response with error' do
        allow_any_instance_of(Twilio::REST::Client).to receive_message_chain(
          :verify, :v2, :services, :verification_checks, :create
        ).and_raise(twilio_error)

        expect { subject }.to broadcast(:invalid)

        check_audit_log(code_type: 'verification_code', code: verification_code, outcome: 'failed',
                        failure_reason: '[HTTP 400] 400 :')
      end
    end

    private

    def mobile_verification_token(mobile_number)
      JWT.encode({ data: mobile_number }, Rails.application.secrets.encrypted_key)
    end

    def check_audit_log(params)
      audit_log = AuditLog.last

      expect(audit_log.user_id).to eq(nil)
      expect(audit_log.action).to eq('confirm_verification_code')
      expect(audit_log.project_id).to eq(project.id)
      expect(audit_log.payload).to include('mobile_number' => to_mobile_no)
      expect(audit_log.payload).to include(params[:code_type] => params[:code])
      expect(audit_log.outcome).to eq(params[:outcome])
      expect(audit_log.failure_reason).to eq(params[:failure_reason])
    end
  end
end
