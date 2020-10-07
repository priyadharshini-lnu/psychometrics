# frozen_string_literal: true

module Campaigns
  module Users
    class ImportForm < Rectify::Form
      mimic :user

      attribute :import_data, Array
      attribute :operation, String

      validates :operation, inclusion: { in: %w[skip_existing add_with_existing_response add_and_allow_new_response] }

      validate :validate_header
      validate :validate_body

      private

      def validate_header
        errors.add(:import_data, :invalid_header) if import_data.first != UserDecorator.export_headers
      end

      def validate_body
        import_data[1..-1].each.with_index do |attrs, index|
          form = ::Campaigns::Users::Import::CreateForm.new(attrs.merge(operation: operation)).
                 with_context(campaign: context.campaign)
          errors.add(:import_data, "Row #{index + 1}: #{form.errors.full_messages.join("\n")}") if form.invalid?
        end
      end
    end
  end
end
