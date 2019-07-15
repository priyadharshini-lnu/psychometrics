# frozen_string_literal: true

module Threesixty
  module Relationships
    class DestroyForm < Rectify::Form
      attribute :id, Integer

      validates :id, presence: true
      validate :check_existing_participants

      attr_reader :user

      def check_existing_participants
        errors.add(:relationship, 'This Relationship is used') if Participant.where(relationship_id: id).exists?
      end
    end
  end
end
