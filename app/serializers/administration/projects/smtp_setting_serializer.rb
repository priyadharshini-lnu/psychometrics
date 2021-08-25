# frozen_string_literal: true

module Administration
  module Projects
    class SmtpSettingSerializer < ActiveModel::Serializer
      attributes :id, :from_name, :from_email, :host, :encryption, :port, :user_name, :password,
                 :authentication_type, :enabled
    end
  end
end
