# frozen_string_literal: true

module Threesixty
  module Options
    class ReportOptionForm < Rectify::Form
      attribute :access, Hash
      attribute :approval, Hash
      attribute :availablity, Hash

      validate :validate_access_fields
      # validate :validate_approval_fields
      # validate :validate_availiblity_fields

      def validate_access_fields
        form = ReportAccessOptionForm.new(access).with_context(context)
        add_errors_from_nested(:subject, form)
      end

      def validate_approval_fields
        form = ApprovalOptionForm.new(approval).with_context(context)
        add_errors_from_nested(:manager, form)
      end

      def validate_availiblity_fields
        form = AvailablityOptionForm.new(availablity).with_context(context)
        add_errors_from_nested(:evaluator, form)
      end

      private

      # We don't need this for now.
      def add_errors_from_nested(key, form)
        # form.validate
        # form.errors.messages.values.first.each { |error|  errors.add(key, error) } if form.invalid?
        # public_send("#{key}=", form.attributes)
      end
    end
  end
end
