# frozen_string_literal: true

class Users::MobileNumberVerificationsController < ApplicationController
  include AsyncRequestHandler

  skip_before_action :authenticate_user!
  before_action :ensure_valid_invitation_code, only: %i[send_verification_code]

  layout false

  async_request :verify, handler: Sms::Verification::ConfirmCode,
    permit_params: ->(params) { params.require(:mobile_number_verification).permit(:mobile_number, :verification_code) }

  async_request :send_verification_code, handler: Sms::Verification::SendCode,
    permit_params: ->(params) { params.require(:mobile_number_verification).permit(:mobile_number) }

  private

  def mobile_number
    params[:mobile_number]
  end

  def ensure_valid_invitation_code
    if via_registration_code? && registration_code_record.blank?
      error_message = I18n.t('activemodel.errors.models.register.attributes.registration_code.invalid')

      audit_failure(error_message)

      render json: { errors: [error_message] },
             status: 422
    end

    if via_sms_invite_code? && sms_invite_record.blank?
      error_message = I18n.t('activemodel.errors.models.register.attributes.sms_invite_code.invalid')

      audit_failure(error_message)

      render json: { errors: [error_message] },
             status: 422
    end
  end

  def audit_failure(error_message)
    audit! :send_verification_code, nil, payload: params, outcome: :failed, failure_reason: error_message
  end

  def registration_code_record
    @registration_code_record ||= ::Administration::Clients::RegistrationCodes::VerificationQuery.
                                  new(@current_project, params[:mobile_number_verification][:registration_code]).query
  end

  def sms_invite_record
    @sms_invite_record ||= Administration::Clients::SmsInvites::VerificationQuery.
                           new(@current_project, params[:sms_invite_code]).query
  end

  def via_sms_invite_code?
    params[:mobile_number_verification][:sms_invite_code].present?
  end

  def via_registration_code?
    params[:mobile_number_verification][:registration_code].present?
  end
end
