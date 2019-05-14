# frozen_string_literal: true

module Threesixty
  module Evaluators
    class CreateAllForm < Rectify::Form
      attr_reader :evaluators_with_relations
      attribute :evaluators, Hash

      validate :no_duplicates
      validate :evaluator_fields

      def no_duplicates
        if evaluators.map do |_key, evaluator|
          "#{evaluator[:subject_email]}/#{evaluator[:evaluator_email]}"
        end.uniq.size != evaluators.size
          errors.add(:evaluators, :email_duplicated)
        end
      end

      def evaluator_fields
        @evaluators_with_relations = evaluators.map do |_key, evaluator|
          form = CreateOneForm.new(evaluator).with_context(context)
          errors.add(:evaluators, form.errors.messages.values.first.first) if form.invalid?
          evaluator.merge(subject: form.subject,
                          subject_user: form.subject_user,
                          evaluator_user: form.evaluator_user,
                          relationship: form.relationship)
        end
      end
    end
  end
end
