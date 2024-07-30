# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingSerializer < Panko::Serializer
      attributes :id, :from_name, :from_email, :host, :encryption, :port, :user_name,
                 :authentication_type, :enabled, :use_sender_verification
    end
  end
end
