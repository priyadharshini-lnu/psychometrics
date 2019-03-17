module Api
  module V1
    class ResultSerializer < ActiveModel::Serializer
      attributes :any
      def any
        :any
      end
    end
  end
end
