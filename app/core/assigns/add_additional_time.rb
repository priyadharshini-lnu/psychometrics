# frozen_string_literal: true

module Assigns
  class AddAdditionalTime < BaseCommand
    private_attr_reader :assign_with_result, :original_or_self, :additional_time

    def initialize(assign, additional_time)
      @assign_with_result = assign.assign_with_result
      @original_or_self = assign.original_or_self
      @additional_time = additional_time
    end

    def call
      transaction do
        remove_reports if assign_with_result.completed?
        add_additional_time
      end

      broadcast :ok
    end

    private

    def add_additional_time
      assign_with_result.update(
        status: :interrupted,
        expiry_date: nil,
        last_activity_at: nil,
        additional_time: additional_time
      )
    end

    def remove_reports
      original_or_self.assigns_reports.each do |ar|
        ar.pdf.purge
        ar.generating = false
        ar.save
      end
    end
  end
end
