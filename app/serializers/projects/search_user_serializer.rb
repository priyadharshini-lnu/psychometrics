# frozen_string_literal: true

module Projects
  class SearchUserSerializer < Panko::Serializer
    # NOTE: object is not always a User here, sometimes it is a SheetRow.
    # Use safe navigation whenever you want to access any user properties.
    attributes :id, :email, :first_name, :last_name, :locale, :is_uat

    def locale
      object.user_profile&.locale
    end

    def is_uat
      object.try(:is_uat) || false
    end
  end
end
