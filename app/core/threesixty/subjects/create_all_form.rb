# frozen_string_literal: true

module Threesixty
  module Subjects
    class CreateAllForm < Rectify::Form
      attribute :subjects, Hash

      validate :no_duplicates
      validate :subject_fields

      def no_duplicates
        if subjects.map { |_key, subject| subject[:email] }.uniq.size != subjects.size
          errors.add(:subjects, :email_duplicated)
        end
      end

      def subject_fields
        subjects.each do |_key, subject|
          form = CreateOneForm.new(subject).with_context(context)
          errors.add(:subjects, form.errors.messages.values.first.first) if form.invalid?
        end
      end
    end
  end
end
