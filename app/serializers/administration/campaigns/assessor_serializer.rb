# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :created_at, :updated_at,
                 :status, :evaluations_completed

      delegate :first_name, :last_name, :email, to: :user

      def user
        object.user
      end

      def status
        # TODO: Implement
        'undefined'
      end

      def evaluations_completed
        # TODO: Implement
        -1
      end
    end
  end
end
