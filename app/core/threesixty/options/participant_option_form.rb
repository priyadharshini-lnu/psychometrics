# frozen_string_literal: true

module Threesixty
  module Options
    class ParticipantOptionForm < Rectify::Form
      attribute :global, Hash
      attribute :subject, Hash
      attribute :manager, Hash
      attribute :evaluator, Hash

      validate :validate_global_fields
      validate :validate_subject_fields
      validate :validate_manager_fields
      validate :validate_evaluator_fields

      def validate_global_fields
        form = GlobalOptionForm.new(global).with_context(context)
        add_errors_from_nested(:global, form)
      end

      def validate_subject_fields
        form = SubjectOptionForm.new(subject).with_context(context)
        add_errors_from_nested(:subject, form)
      end

      def validate_manager_fields
        form = ManagerOptionForm.new(manager).with_context(context)
        add_errors_from_nested(:manager, form)
      end

      def validate_evaluator_fields
        form = EvaluatorOptionForm.new(evaluator).with_context(context)
        add_errors_from_nested(:evaluator, form)
      end

      private

      def add_errors_from_nested(key, form)
        form.validate
        form.errors.messages.values.first.each { |error| errors.add(key, error) } if form.invalid?
        public_send(:"#{key}=", form.attributes)
      end
    end
  end
end
