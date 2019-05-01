# frozen_string_literal: true

module Threesixty
  module Evaluators
    class CreateOneForm < Rectify::Form
      attribute :evaluator_first_name, String
      attribute :evaluator_last_name, String
      attribute :evaluator_email, String
      attribute :relationship_name, String
      attribute :subject_email, String

      validates :evaluator_email, presence: true
      validates :evaluator_email, format: { with: URI::MailTo::EMAIL_REGEXP }

      validates :subject_email, presence: true
      validates :subject_email, format: { with: URI::MailTo::EMAIL_REGEXP }

      validate :check_existing_relationship
      validate :check_existing_evaluator_subject_relation

      def check_existing_relationship
        errors.add(:relationship_name, :invalid) unless relationship
      end

      def check_existing_evaluator_subject_relation
        if ::Participant.where(relationship: relationship, subject: subject_user, evaluator: evaluator_user).exists?
          errors.add(:evaluator_email, :already_exists)
        end
      end

      def relationship
        @relationship ||= ::Relationships::ByCampaign.new(context.campaign).query.where(name: relationship_name).first
      end

      def subject
        @subject ||= ::Threesixty::Subject.includes(:user).where(users: { email: subject_email }).first
      end

      def subject_user
        @subject_user ||= subject&.user
      end

      def evaluator_user
        @evaluator_user ||= ::Threesixty::Evaluator.includes(:user).where(users: { email: evaluator_email }).first&.user
      end
    end
  end
end
