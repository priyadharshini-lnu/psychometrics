# frozen_string_literal: true

module Threesixty
  module Participants
    class CreateForm < Rectify::Form
      attribute :evaluator_id, Integer
      attribute :relationship_id, Integer

      validates :evaluator_id, :relationship_id, presence: true

      validate :check_subject_exists
      validate :check_existing_participant

      def check_subject_exists
        errors.add(:subject, 'is required') unless subject
      end

      def check_existing_participant
        if subject.participants.find_by(evaluator_id: evaluator_id)
          errors.add(:evaluator_id, 'already exists')
        end
      end

      def subject
        @subject ||= context.subject
      end

      def campaign
        @campaign ||= context.campaign
      end

      def error_mesages
        errors.keys.each.with_object({}) do |attribute, list|
          list[attribute] = errors.full_messages_for(attribute)
          list
        end
      end
    end
  end
end
