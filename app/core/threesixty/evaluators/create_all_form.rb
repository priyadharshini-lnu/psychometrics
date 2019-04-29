# frozen_string_literal: true

module Threesixty
  module Evaluators
    class CreateAllForm < Rectify::Form
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
        evaluators.each do |_key, evaluator|
          form = CreateOneForm.new(evaluator).with_context(context)
          errors.add(:evaluators, form.errors.messages.values.first.first) if form.invalid?
        end
      end
    end
  end
end
