# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria < BaseCommand
    class Filter
      CRITERIA_RESOLVER = [
        {
          field_types: ['name_or_email', 'first_name', 'last_name'],
          class_name: ParticipatableByCriteria::ByUserFields
        },
        {
          field_types: ['datasheet'],
          class_name: Participatable::ByDatasheetField
        },
        {
          field_types: ['relationship'],
          class_name: Participatable::ByRelationship
        },
        {
          field_types: ['nomination_requirements'],
          class_name: Participatable::ByNominationRequirement
        },
        {
          field_types: ['self_evaluations'],
          class_name: Participatable::BySelfEvaluation
        },
        {
          field_types: ['evaluations'],
          class_name: Participatable::ByEvaluations
        },
        {
          field_types: ['evaluations_received'],
          class_name: Participatable::ByEvaluationsReceived
        },
        {
          field_types: ['subject_datasheet'],
          class_name: Participatable::BySubjectDatasheetFields
        },
        {
          field_types: ['evaluator_type'],
          class_name: Participatable::ByEvaluatorType
        },
        {
          field_types: ['tasks'],
          class_name: Participatable::ByTasks
        },
        {
          field_types: ['manager_tasks'],
          class_name: Participatable::ByManagerTasks
        },
      ]


      def initialize(threesixty_campaing, participatable_type, criteria_list)
        @threesixty_campaign = threesixty_campaign
        @participatable_type = participatable_type
        @criteria_list = criteria_list
        set_participatables
      end

      def call!
        CRITERIA_RESOLVER.each do |resolver|
          valid_criteria = criteria_list.select { |c| resolver[:field_types].include?(c['field']) }
          @participatables = resolver[:class_name].call!(
            threesixty_campaign: threesixty_campaign,
            participatable_type: participatable_type,
            participatables: @participatables,
            criteria_list: valid_criteria,
          )
        end
        @participatables
      end

      private


      attr_reader :threesixty_campaign, :participatable_type, :criteria_list

      def set_participatables
        @participatables ||= if participatable_type == :subject
          threesixty_campaign.subjects
        elsif participatable_type == :evaluator
          threesixty_campaign.evaluators
        end.includes(:user)
      end
    end
  end
end
