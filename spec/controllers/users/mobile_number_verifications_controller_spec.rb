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
      let(:params) { { mobile_number: mobile_number, registration_code: 'abc', project_id: project.id } }

      it 'calls the SendCode service and returns a success' do
        verification_response = Sms::Verification::VerificationResponse.new(
          error_message: nil,
          status: 'approved',
          to_mobile_no: mobile_number
        )

        stub_command_broadcast('Sms::Verification::SendCode', :ok, verification_response)

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:success)
      end

      it 'returns an error message when the SendCode service fails' do
        verification_response = Sms::Verification::VerificationResponse.new(
          error_message: 'An error occurred',
          status: 'failed',
          to_mobile_no: mobile_number
        )

        stub_command_broadcast('Sms::Verification::SendCode', :error, verification_response)

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors'][0]).to eq('An error occurred')
      end

      it 'returns an error message when the registration code is invalid' do
        allow_any_instance_of(Administration::Clients::RegistrationCodes::VerificationQuery).
          to receive(:query).and_return([])

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors'][0]).to eq('Registration code is invalid')
      end
    end

    context 'with sms invite code' do
      let(:sms_invite) do
        create(
          :sms_invite, campaign: campaign, code: 'abc', expiry: 5.days.from_now
        )
      end

      let(:params) { { mobile_number: mobile_number, sms_invite_code: 'abc', project_id: project.id } }

      it 'returns an error message when the sms invite code is invalid' do
        allow_any_instance_of(Administration::Clients::SmsInvites::VerificationQuery).
          to receive(:query).and_return([])

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors'][0]).to eq('SMS Invite code is invalid')
      end

      it 'calls the SendCode service and returns a success' do
        verification_response = Sms::Verification::VerificationResponse.new(
          error_message: nil,
          status: 'approved',
          to_mobile_no: mobile_number
        )
        stub_command_broadcast('Sms::Verification::SendCode', :ok, verification_response)

        allow_any_instance_of(Administration::Clients::SmsInvites::VerificationQuery).
          to receive(:query).and_return([sms_invite])

        post :send_verification_code, params: params, format: :json

        expect(response).to have_http_status(:success)
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
      status, response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
      expect(status).to eq('not_started')
      expect(response).to be_an_instance_of(AsyncResponseRequest::AsyncResponse)
      expect(response.processing_status).to eq('not_started')
    end
  end
end
