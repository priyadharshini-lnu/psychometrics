# frozen_string_literal: true

module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email, :photo, :datasheet

    def photo
      object.user_profile.photo&.url
    end

    def datasheet
      campaign&.datasheet_data(object.email) || {}
    end

    private

    def campaign
      instance_options[:campaign]
    end
  end
end
