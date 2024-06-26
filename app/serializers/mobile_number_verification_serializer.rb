# frozen_string_literal: true

class MobileNumberVerificationSerializer < Panko::Serializer
  attributes :mobile_number, :status, :verification_token

  def verification_token
    JWT.encode(
      { data: mobile_number, exp: 10.minutes.from_now.to_i },
      Settings.secrets.encrypted_key.to_s
    )
  end

  def mobile_number
    object.to_mobile_no
  end
end
