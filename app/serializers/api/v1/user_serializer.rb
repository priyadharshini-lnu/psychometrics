module Api
  module V1
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :created_at, :updated_at, :campaign_ids

      def campaign_ids
        [2, 3]
      end
    end
  end
end
