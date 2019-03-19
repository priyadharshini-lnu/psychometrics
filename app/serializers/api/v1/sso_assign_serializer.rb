module Api
  module V1
    class SsoAssignSerializer < ActiveModel::Serializer
      attributes :id, :name, :url, :status
      def id
        object.assessment.id
      end
      def name
        object.assessment.name
      end

      def url
        "#{instance_options[:url]}?assign_id=#{object.id}"
      end

      def status
        object.status
      end
    end
  end
end
