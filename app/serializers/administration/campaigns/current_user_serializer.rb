# frozen_string_literal: true

module Administration
  module Campaigns
    class CurrentUserSerializer < ActiveModel::Serializer
      attributes :id, :grants, :role

      def grants
        instance_options[:current_membership]&.grants&.data || {}
      end
    end
  end
end
