# frozen_string_literal: true

module Threesixty
  module Evaluators
    class CreateOneForm < Rectify::Form
      attribute :evaluator_first_name, String
      attribute :evaluator_last_name, String
      attribute :evaluator_email, String
      attribute :evaluator_password, String
      attribute :relationship_name, String
      attribute :subject_email, String

      validates :evaluator_email, :subject_email, format: { with: Devise.email_regexp }
      validates :evaluator_email, :subject_email, :evaluator_first_name, :evaluator_last_name, presence: true
      validates :evaluator_password, length: { within: Devise.password_length }, allow_blank: true

      validate :check_subject
      validate :check_existing_relationship
      validate :check_existing_evaluator_subject_relation

      def check_subject
        errors.add(:subject_email, :not_exists, email: subject_email) unless subject
      end

      def check_existing_relationship
        errors.add(:relationship_name, :invalid, name: relationship_name) unless relationship
      end

      def check_existing_evaluator_subject_relation
        if ::Threesixty::Participant.where(
          relationship: relationship, subject: subject_user, evaluator: evaluator_user, campaign: context.campaign
        ).exists?
          errors.add(:evaluator_email, :already_exists)
        end
      end

      def relationship
        @relationship ||= ::Relationships::ByCampaign.new(context.campaign).query.where(name: relationship_name).first
      end

      def subject
        @subject ||= ::Threesixty::Subject.includes(:user).find_by(
          campaign_id: context.campaign.id, users: { email: subject_email }
        )
      end

      def subject_user
        @subject_user ||= subject&.user
      end

      def evaluator_user
        @evaluator_user ||= context.campaign.evaluators.includes(:user).
                            where(users: { email: evaluator_email }).first&.user
      end
    end
  end
end
