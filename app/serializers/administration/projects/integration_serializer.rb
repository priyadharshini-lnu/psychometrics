# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationSerializer < ActiveModel::Serializer
      attributes :id, :name, :active

      def serializable_hash(*)
        super.merge(object.config.except('password'))
      end
    end
  end
end
