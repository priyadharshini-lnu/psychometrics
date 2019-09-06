# frozen_string_literal: true

module Threesixty
  module Options
    class SubjectOptionForm < Rectify::Form
      ALL_BOOLEAN_FIELDS = %i(
        can_evaluate_self
        limit_self_evaluation_by_criteria
        can_nominate_evaluators
        can_nominate_anyone_not_in_assessment
        can_nominate_anyone_in_assessment
        limit_nomination_by_subject_to_anyone_in_assessment
        can_nominate_anyone_from_datasheet
        limit_nomination_by_subject_from_datasheet
        cannot_remove_nomination_set_by_manager_and_admin
        limit_relationship_that_subject_can_select
        can_view_completion_status_of_evaluation
        can_view_individual_evaluations
      )

      DATA_SHEET_CRITERIA_FIELD = %i(
        self_evaluation_criteria
        limit_nomination_by_subject_to_anyone_criteria
        limit_nomination_by_subject_from_datasheet_criteria
      )

      attribute :can_evaluate_self, Boolean, deafult: false
      attribute :limit_self_evaluation_by_criteria, Boolean, deafult: false
      attribute :can_nominate_evaluators, Boolean, deafult: false
      attribute :can_nominate_anyone_not_in_assessment, Boolean, deafult: false
      attribute :can_nominate_anyone_in_assessment, Boolean, deafult: false
      attribute :limit_nomination_by_subject_to_anyone_in_assessment, Boolean, deafult: false
      attribute :can_nominate_anyone_from_datasheet, Boolean, deafult: false
      attribute :limit_nomination_by_subject_from_datasheet, Boolean, deafult: false
      attribute :cannot_remove_nomination_set_by_manager_and_admin, Boolean, deafult: false
      attribute :limit_relationship_that_subject_can_select, Boolean, deafult: false
      attribute :can_select_relationships, Hash, deafult: {}
      attribute :can_view_completion_status_of_evaluation, Boolean, deafult: false
      attribute :can_view_individual_evaluations, Boolean, deafult: false

      attribute :self_evaluation_criteria, Array[Hash], default: []
      attribute :limit_nomination_by_subject_to_anyone_criteria, Array[Hash], default: []
      attribute :limit_nomination_by_subject_from_datasheet_criteria, Boolean, default: []

      validates *ALL_BOOLEAN_FIELDS,
        inclusion: { in: [ true, false ], message: "doesn't have a valid value" },
        allow_nil: true
      validate :validate_data_stream_fields

      def validate_data_stream_fields
        DATA_SHEET_CRITERIA_FIELD.each do |key|
          criteria_list = public_send(key)
          form = DatsheetCriteriaForm.new(criteria_list: criteria_list).with_context(context)
          form.errors.messages.values.first.each { |error| errors.add(key, error) } if form.invalid?
        end
      end
    end
  end
end
