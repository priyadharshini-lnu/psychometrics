# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria < BaseCommand
    class Filter
      CRITERIA_FIELD_RESOLVER = [
        {
          field_types: ['name_or_email', 'first_name', 'last_name'],
          class_name: ParticipatableByCriteria::ByUserFields
        },
        {
          field_types: ['datasheet'],
          class_name: Participatable::ByDatasheetField
        },
        {
          field_types: ['has_relationship'],
          class_name: Participatable::ByRelationship
        },
        {
          field_types: ['nomination_requirements'],
          class_name: Participatable::ByNominationRequirement
        },
        {
          field_types: ['has_relationship'],
          class_name: Participatable::ByRelationship
        },
        {
          field_types: ['self_evaluations'],
          class_name: Participatable::BySelfEvaluation
        }
      ]


      def initialize(threesixty_campaing, participatable_type, criteria_list)
        @threesixty_campaign = threesixty_campaign
        @participatable_type = participatable_type
        @criteria_list = criteria_list
        set_participatables
      end

      def call!
        CRITERIA_FIELD_RESOLVER.each do |resolver|
          valid_criteria = criteria_list.select { |c| resolver[:field_types].include?(c['field']) }
          @participatables = resolver[:class_name].call!(threesixty_campaign, @participatables, valid_criteria)
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
