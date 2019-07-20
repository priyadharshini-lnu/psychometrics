# frozen_string_literal: true

module Threesixty
  module Relationships
    class DestroyForm < Rectify::Form
      attribute :id, Integer

      validates :id, presence: true
      validate :check_relationship_not_in_use

      attr_reader :user

      def check_relationship_not_in_use
        errors.add(:relationship, 'This Relationship is used') if Participant.where(relationship_id: id).exists?
      end
    end
  end
end
