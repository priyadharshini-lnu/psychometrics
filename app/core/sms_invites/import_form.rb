# frozen_string_literal: true

module SmsInvites
  class ImportForm < Rectify::Form
    VALID_HEADERS = %w[first_name last_name mobile_no locale].freeze

    mimic :sms_invites_import

    attribute :import_data, Array

    validate :validate_header
    validate :validate_body, if: :valid_headers?
    validate :validate_duplicated_mobile_no

    private

    def validate_header
      errors.add(:import_data, :invalid_header) unless valid_headers?
    end

    def validate_body
      import_data.each_with_index do |attrs, index|
        attrs.transform_values! { |value| Utility::String.remove_csv_injection_marker(value) }
        form = ::SmsInvites::Form.new(attrs).with_context(campaign: context.campaign)

        errors.add(:import_data, "Row #{index + 1}: #{form.errors.messages.values.first.first}") if form.invalid?
      end
    end

    def validate_duplicated_mobile_no
      mobile_numbers = []
      import_data.map { |a| a['mobile_no'] }.group_by { |a| a }.each do |mobile_no, group|
        mobile_numbers << mobile_no if group.size > 1
      end
      if mobile_numbers.present?
        errors.add(:import_data, :duplicated_mobile_numbers, mobile_numbers: mobile_numbers.join(', '))
      end
    end

    def valid_headers?
      import_data.first.keys.sort == VALID_HEADERS.sort
    end
  end
end
