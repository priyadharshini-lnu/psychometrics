module Threesixty
  module Options
    class ParticipationOptionForm < Rectify::Form

      ALL_BOOLEAN_FIELDS = %i(
        evaluator_can_decline_nomination
        email_subject_when_evaluators_declines_nomination
        manager_can_view_nominations
        manager_can_choose_evaluators
        managers_approve_nominations
        email_managers_on_nomination_approval
        subjects_can_email_managers
        email_subjects_when_manager_nominates_them
        email_subject_when_manager_declines_nomination
        manager_approves_evaluations
        subject_can_evaluate_self
        limit_self_evaluation_by_criteria
        subject_can_opt_in_assessment
        restrict_subject_email_to_domail
        subject_can_nominate_evaluators
        subject_can_nominate_anyone_not_in_assessment
        subject_can_nominate_anyone_in_assessment
        limit_nomination_by_subject_to_anyone_in_assessment
        subject_can_nominate_anyone_from_datasheet
        limit_nomination_by_subject_from_datasheet
        subject_cannot_remove_nomination_set_by_manager_and_admin
        subject_can_select_relationship
        limit_relationship_that_subject_can_select
        subject_can_select_customer_relationship
        subject_can_select_direct_report_relationship
        subject_can_select_manager_relationship
        subject_can_select_peer_relationship
        subject_can_select_supplier_relationship
        subject_can_view_completion_status_of_evaluation
        subject_can_view_individual_evaluations
      )

      DATA_SHEET_CRITERIA_FIELD = %i(
        self_evaluation_criteria
        limit_nomination_by_subject_to_anyone_criteria
        limit_nomination_by_subject_from_datasheet_criteria
      )

      attribute :evaluator_can_decline_nomination, Boolean, deafult: false
      attribute :email_subject_when_evaluators_declines_nomination, Boolean, deafult: false
      attribute :manager_can_view_nominations, Boolean, deafult: false
      attribute :manager_can_choose_evaluators, Boolean, deafult: false
      attribute :managers_approve_nominations, Boolean, deafult: false
      attribute :email_managers_on_nomination_approval, Boolean, deafult: false
      attribute :subjects_can_email_managers, Boolean, deafult: false
      attribute :email_subjects_when_manager_nominates_them, Boolean, deafult: false
      attribute :email_subject_when_manager_declines_nomination, Boolean, deafult: false
      attribute :manager_approves_evaluations, Boolean, deafult: false
      attribute :subject_can_evaluate_self, Boolean, deafult: false
      attribute :limit_self_evaluation_by_criteria, Boolean, deafult: false
      attribute :subject_can_opt_in_assessment, Boolean, deafult: false
      attribute :restrict_subject_email_to_domail, Boolean, deafult: false
      attribute :subject_can_nominate_evaluators, Boolean, deafult: false
      attribute :subject_can_nominate_anyone_not_in_assessment, Boolean, deafult: false
      attribute :subject_can_nominate_anyone_in_assessment, Boolean, deafult: false
      attribute :limit_nomination_by_subject_to_anyone_in_assessment, Boolean, deafult: false
      attribute :subject_can_nominate_anyone_from_datasheet, Boolean, deafult: false
      attribute :limit_nomination_by_subject_from_datasheet, Boolean, deafult: false
      attribute :subject_cannot_remove_nomination_set_by_manager_and_admin, Boolean, deafult: false
      attribute :subject_can_select_relationship, Boolean, deafult: false
      attribute :limit_relationship_that_subject_can_select, Boolean, deafult: false
      attribute :subject_can_select_customer_relationship, Boolean, deafult: false
      attribute :subject_can_select_direct_report_relationship, Boolean, deafult: false
      attribute :subject_can_select_manager_relationship, Boolean, deafult: false
      attribute :subject_can_select_peer_relationship, Boolean, deafult: false
      attribute :subject_can_select_supplier_relationship, Boolean, deafult: false
      attribute :subject_can_view_completion_status_of_evaluation, Boolean, deafult: false
      attribute :subject_can_view_individual_evaluations, Boolean, deafult: false

      attribute :self_evaluation_criteria, Array[Hash], default: []
      attribute :limit_nomination_by_subject_to_anyone_criteria, Array[Hash], default: []
      attribute :limit_nomination_by_subject_from_datasheet_criteria, Boolean, default: []

      attribute :restricted_domain_name, String, deafult: false

      validates *ALL_BOOLEAN_FIELDS,
        inclusion: { in: [ true, false ], message: "doesn't have valid value" },
        allow_nil: true
      validate :validate_data_stream_fields

      def validate_data_stream_fields
        DATA_SHEET_CRITERIA_FIELD.each do |key|
          criterias = public_send(key)
          criterias.each do |criteria|
            validate_criteria_operator(key, criteria[:operator])
            validate_criteria_field(key, criteria[:field])
          end
        end
      end

      def validate_criteria_operator(criteria_key, operator)
        unless ['equal', 'is_same_as_subject'].include?(operator)
          errors.add(criteria_key, 'has invalid operator')
        end
      end

      def validate_criteria_field(criteria_key, field)
      end

      def allowed_keys
        ALL_BOOLEAN_FIELDS + DATA_SHEET_CRITERIA_FIELD
      end

      def valid_options
        options = params[:options]
        options.slice(**valid_option_keys)
        scrub_datasheet_criteria_options(options)
      end
    end
  end
end