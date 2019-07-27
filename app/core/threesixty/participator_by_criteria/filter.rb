# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class Filter < BaseCommand
      CRITERIA_RESOLVER = [
        {
          field_types: %w[name_or_email first_name last_name],
          class_name: ParticipatorByCriteria::ByUserFields
        },
        {
          field_types: %w[datasheet],
          class_name: ParticipatorByCriteria::ByDatasheetFields
        },
        {
          field_types: %w[relationship],
          class_name: ParticipatorByCriteria::ByRelationship
        },
        {
          field_types: %w[nomination_requirements],
          class_name: ParticipatorByCriteria::ByNominationRequirement
        },
        {
          field_types: %w[self_evaluations],
          class_name: ParticipatorByCriteria::BySelfEvaluation
        },
        {
          field_types: %w[evaluations],
          class_name: ParticipatorByCriteria::ByEvaluations
        },
        {
          field_types: %w[evaluations_received],
          class_name: ParticipatorByCriteria::ByEvaluationsReceived
        },
        {
          field_types: %w[subject_datasheet],
          class_name: ParticipatorByCriteria::BySubjectDatasheetFields
        },
        {
          field_types: %w[evaluator_type],
          class_name: ParticipatorByCriteria::ByEvaluatorType
        },
        {
          field_types: %w[tasks],
          class_name: ParticipatorByCriteria::ByTasks
        },
        {
          field_types: %w[manager_tasks],
          class_name: ParticipatorByCriteria::ByManagerTasks
        },
        {
          field_types: %w[subject_status],
          class_name: ParticipatorByCriteria::BySubjectStatus
        }
      ].freeze

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @participator_types = Array.wrap(options[:participator_types])
        @participators = options[:participators]
        @criteria_list = options[:criteria_list]
      end

      def call
        participators = participator_types.each_with_object([]) do |participator_type, acc|
          acc << get_participators_by_filter(participator_type)
        end.flatten.uniq

        broadcast :ok, participators
      end

      private

      private_attr_reader :threesixty_campaign, :participator_types, :criteria_list

      def get_participators_by_filter(participator_type)
        participators = @participators || get_participators(participator_type)
        CRITERIA_RESOLVER.each do |resolver|
          valid_criteria = criteria_list.select { |c| resolver[:field_types].include?(c['field']) }
          next if valid_criteria.empty?

          participators = resolver[:class_name].call!(
            threesixty_campaign: threesixty_campaign,
            participator_type: participator_type,
            participators: participators,
            criteria_list: valid_criteria
          )
        end
        participators
      end

      def get_participators(participator_type)
        if participator_type == :subject
          threesixty_campaign.subjects
        elsif participator_type == :evaluator
          threesixty_campaign.evaluators
        end.includes(:user)
      end
    end
  end
end
