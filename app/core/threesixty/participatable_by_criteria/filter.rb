# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class Filter < BaseCommand
      CRITERIA_RESOLVER = [
        {
          field_types: ['name_or_email', 'first_name', 'last_name'],
          class_name: ParticipatableByCriteria::ByUserFields
        },
        {
          field_types: ['datasheet'],
          class_name: ParticipatableByCriteria::ByDatasheetFields
        },
        {
          field_types: ['relationship'],
          class_name: ParticipatableByCriteria::ByRelationship
        },
        {
          field_types: ['nomination_requirements'],
          class_name: ParticipatableByCriteria::ByNominationRequirement
        },
        {
          field_types: ['self_evaluations'],
          class_name: ParticipatableByCriteria::BySelfEvaluation
        },
        {
          field_types: ['evaluations'],
          class_name: ParticipatableByCriteria::ByEvaluations
        },
        {
          field_types: ['evaluations_received'],
          class_name: ParticipatableByCriteria::ByEvaluationsReceived
        },
        {
          field_types: ['subject_datasheet'],
          class_name: ParticipatableByCriteria::BySubjectDatasheetFields
        },
        {
          field_types: ['evaluator_type'],
          class_name: ParticipatableByCriteria::ByEvaluatorType
        },
        {
          field_types: ['tasks'],
          class_name: ParticipatableByCriteria::ByTasks
        },
        {
          field_types: ['manager_tasks'],
          class_name: ParticipatableByCriteria::ByManagerTasks
        },
      ]


      def initialize(threesixty_campaign, participatable_type, criteria_list)
        @threesixty_campaign = threesixty_campaign
        @participatable_type = participatable_type
        @criteria_list = criteria_list
        set_participatables
      end

      def call
        CRITERIA_RESOLVER.each do |resolver|
          valid_criteria = criteria_list.select { |c| resolver[:field_types].include?(c['field']) }
          next if valid_criteria.empty?

          @participatables = resolver[:class_name].call!(
            threesixty_campaign: threesixty_campaign,
            participatable_type: participatable_type,
            participatables: @participatables,
            criteria_list: valid_criteria,
          )
        end
        broadcast :ok, @participatables
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
