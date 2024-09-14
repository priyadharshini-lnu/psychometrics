# frozen_string_literal: true

module Projects
  class SearchUserSerializer < Panko::Serializer
    attributes :id, :email, :first_name, :last_name, :locale

    def locale
      object.user_profile.locale
    end
  end
end
