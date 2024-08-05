# frozen_string_literal: true

module Shared
  module AuditLogSerializers
    class ClientSerializer < Panko::Serializer
      attributes :id, :name
    end

    class ProjectSerializer < Panko::Serializer
      attributes :id, :name
    end

    class CampaignSerializer < Panko::Serializer
      attributes :id, :name, :project_id
    end

    class UserSerializer < Panko::Serializer
      attributes :email, :full_name

      def full_name
        object.decorate.full_name
      end
    end
  end
end
