module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email
    def id
      object.user_id
    end
  end
end
