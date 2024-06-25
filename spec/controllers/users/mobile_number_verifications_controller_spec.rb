# frozen_string_literal: true

require 'rails_helper'

describe Users::MobileNumberVerificationsController, type: :controller do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }

  let(:mobile_number) { '1234567890' }
  let(:verification_code) { '123456' }
  let(:registration_code) do
    create(
      :registration_code, project: project, campaign: campaign, code: 'abc',
      start_date: 1.day.ago, end_date: 2.days.from_now
    )
  end

  before(:each) do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
  end

  describe '#send_verification_code' do
    before do
      allow_any_instance_of(Administration::Clients::RegistrationCodes::VerificationQuery).
        to receive(:query).and_return([registration_code])
    end

    context 'with registation code' do
      let(:params) do
        { mobile_number_verification: { mobile_number: mobile_number, registration_code: 'abc',
                                        project_id: project.id } }
      end

      it 'queues the request and sets status to in progress' do
        async_request_handler_job = class_double('AsyncRequestHandlerJob').as_stubbed_const
        allow(async_request_handler_job).to receive(:perform_later)

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:ok)
        expect(AsyncRequestHandlerJob).to have_received(:perform_later)

        async_request_uuid = assigns(:async_request_uuid)
        verify_async_response(async_request_uuid, 'not_started')
      end

      it 'returns an error message when the registration code is invalid' do
        allow_any_instance_of(Administration::Clients::RegistrationCodes::VerificationQuery).
          to receive(:query).and_return([])

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors'][0]).to eq('Registration code is invalid')

        check_audit_log(action: 'send_verification_code', mobile_number: mobile_number, code_type: 'registration_code',
                        code: registration_code.code, outcome: 'failed',
                        failure_reason: 'Registration code is invalid')
      end
    end

    context 'with sms invite code' do
      let(:sms_invite) do
        create(
          :sms_invite, campaign: campaign, code: 'abc', expiry: 5.days.from_now
        )
      end

      let(:params) do
        { mobile_number_verification: { mobile_number: mobile_number, sms_invite_code: 'abc',
                                        project_id: project.id } }
      end

      it 'returns an error message when the sms invite code is invalid' do
        allow_any_instance_of(Administration::Clients::SmsInvites::VerificationQuery).
          to receive(:query).and_return([])

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors'][0]).to eq('SMS Invite code is invalid')

        check_audit_log(action: 'send_verification_code', mobile_number: mobile_number,
                        code_type: 'sms_invite_code', code: 'abc', outcome: 'failed',
                        failure_reason: 'SMS Invite code is invalid')
      end

      it 'queues the request and sets status to in progress' do
        allow_any_instance_of(Administration::Clients::SmsInvites::VerificationQuery).
          to receive(:query).and_return([sms_invite])

        async_request_handler_job = class_double('AsyncRequestHandlerJob').as_stubbed_const
        allow(async_request_handler_job).to receive(:perform_later)

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:ok)
        expect(AsyncRequestHandlerJob).to have_received(:perform_later)

        async_request_uuid = assigns(:async_request_uuid)
        verify_async_response(async_request_uuid, 'not_started')
      end
    end
  end

  describe '#verify' do
    it 'queues the request and sets status to in progress' do
      async_request_handler_job = class_double('AsyncRequestHandlerJob').as_stubbed_const
      allow(async_request_handler_job).to receive(:perform_later)

      post :verify,
           params: { mobile_number_verification: { mobile_number: mobile_number,
                                                   verification_code: verification_code } }

      expect(response).to have_http_status(:ok)
      expect(AsyncRequestHandlerJob).to have_received(:perform_later)

      async_request_uuid = assigns(:async_request_uuid)
      verify_async_response(async_request_uuid, 'not_started')
    end
  end

  private

  def verify_async_response(async_request_uuid, expected_status)
    status, response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
    expect(status).to eq(expected_status)
    expect(response).to be_an_instance_of(AsyncResponseRequest::AsyncResponse)
    expect(response.processing_status).to eq(expected_status)
  end

  def check_audit_log(params)
    audit_log = AuditLog.last

    expect(audit_log.user_id).to eq(nil)
    expect(audit_log.action).to eq(params[:action])

    expect(audit_log.payload).to include('mobile_number_verification' => {
      'mobile_number' => '1234567890',
      'project_id' => project.id.to_s,
      params[:code_type] => params[:code]
    })
    expect(audit_log.outcome).to eq(params[:outcome])
    expect(audit_log.failure_reason).to eq(params[:failure_reason])
  end
end
