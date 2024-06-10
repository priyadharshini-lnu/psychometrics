# frozen_string_literal: true

class Users::MobileNumberVerificationsController < ApplicationController
  include AsyncRequestHandler

  skip_before_action :authenticate_user!
  before_action :ensure_valid_invitation_code, only: %i[send_verification_code]

  layout false

  async_request :verify, handler: Sms::Verification::ConfirmCode,
    permit_params: ->(params) { params.require(:mobile_number_verification).permit(:mobile_number, :verification_code) }

  def send_verification_code
    Sms::Verification::SendCode.call!(mobile_number) do
      on(:ok) do
        render json: { status: :ok }
      end

      on(:error) do |result|
        render json: { errors: [result.error_message] }, status: 422
      end
    end
  end

  private

  def mobile_number
    params[:mobile_number]
  end

  def ensure_valid_invitation_code
    if via_registration_code? && registration_code_record.blank?
      render json: { errors: [I18n.t('activemodel.errors.models.register.attributes.registration_code.invalid')] },
             status: 422
    end

    if via_sms_invite_code? && sms_invite_record.blank?
      render json: { errors: [I18n.t('activemodel.errors.models.register.attributes.sms_invite_code.invalid')] },
             status: 422
    end
  end

  def registration_code_record
    @registration_code_record ||= ::Administration::Clients::RegistrationCodes::VerificationQuery.
                                  new(@current_project, params[:registration_code]).query
  end

  def sms_invite_record
    @sms_invite_record ||= Administration::Clients::SmsInvites::VerificationQuery.
                           new(@current_project, params[:sms_invite_code]).query
  end

  def via_sms_invite_code?
    params[:sms_invite_code].present?
  end

  def via_registration_code?
    params[:registration_code].present?
  end
end
