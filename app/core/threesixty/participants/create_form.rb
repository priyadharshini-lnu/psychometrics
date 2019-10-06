# frozen_string_literal: true

module Threesixty
  module Participants
    class CreateForm < Rectify::Form
      attribute :evaluator_email, String
      attribute :relationship_id, Integer

      validates :relationship_id, :evaluator_email, presence: true
      validates :evaluator_email, format: { with: URI::MailTo::EMAIL_REGEXP }

      validate :check_for_valid_user
      validate :check_existing_participant, if: -> { user.present? }
      validate :check_nomination_requirement, if: -> { has_nomination_requirement? }

      attr_reader :user

      def check_nomination_requirement
        condition = nomination_requirement.conditions.find { |c| c['relationship_id'] == relationship_id }

        return if condition.blank? || condition['value'].blank?
        return if condition['comparator'] == 'atleast'
        return if subject_evaluators_count_by_relationship < condition['value'].to_i

        errors.add(:evaluator, I18n.t('evaluators.errors.max_evaluators'))
      end

      def check_existing_participant
        if subject&.participants&.find_by(evaluator_id: user.id)
          errors.add(:evaluator, I18n.t('evaluators.errors.exists'))
        end
      end

      def subject
        @subject ||= context.subject
      end

      def threesixty_campaign
        @threesixty_campaign ||= context.threesixty_campaign
      end

      def options
        @options ||= threesixty_campaign.option
      end

      def error_messages
        errors.keys.each.with_object({}) do |attribute, list|
          list[attribute] = errors.full_messages_for(attribute)
          list
        end
      end

      def check_for_valid_user
        if can_nominate_anyone?
          find_evaluator_user
        elsif can_nominate_anyone_from_datasheet?
          find_from_datasheet
        else
          @user = ::Users::Regular.find_by(email: evaluator_email, project: threesixty_campaign.project)
          can_not_be_processed! unless @user
        end
      end

      def find_evaluator_user
        @user = ::Users::Regular.find_by(email: evaluator_email, project: threesixty_campaign.project)
      end

      def find_from_datasheet
        check_datasheet_criteria(find_evaluator_user)
      end

      def check_datasheet_criteria(evaluator = nil)
        evaluator ||= OpenStruct.new(email: evaluator_email)
        user_datasheet = threesixty_campaign.datasheet&.rows&.find_by(email: evaluator.email)

        return can_not_be_processed! unless user_datasheet

        if limit_nomination_by_subject_from_datasheet?
          unless Threesixty::Evaluators::ResolveEvaluatorCriteria.call!(threesixty_campaign,
                                                                        evaluator, datasheet_criteria, subject.user)
            can_not_be_processed!
          end
        end
      end

      def can_not_be_processed!
        errors.add(:evaluator, I18n.t('evaluators.errors.can_not_processed'))
      end

      private

      def subject_evaluators_count_by_relationship
        subject.evaluators.joins(:relationship).where(relationships: { id: relationship_id }).count
      end

      def nomination_requirement
        @nomination_requirement ||= Threesixty::NominationRequirements::FindForUsers.
                                    call!(subject.user, threesixty_campaign)[subject.user_id]
      end

      def has_nomination_requirement?
        nomination_requirement.present?
      end

      def can_nominate_anyone?
        options.participants.dig('subject', 'can_nominate_anyone_not_in_assessment')
      end

      def can_nominate_anyone_from_datasheet?
        options.participants.dig('subject', 'can_nominate_anyone_from_datasheet')
      end

      def limit_nomination_by_subject_from_datasheet?
        options.participants.dig('subject', 'limit_nomination_by_subject_from_datasheet')
      end

      def datasheet_criteria
        options.participants.dig('subject', 'limit_nomination_by_subject_from_datasheet_criteria')
      end
    end
  end
end
