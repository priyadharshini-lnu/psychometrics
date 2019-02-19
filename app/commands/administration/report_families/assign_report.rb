# frozen_string_literal: true

module Administration
  module ReportFamilies
    class AssignReport < Rectify::Command
      def initialize(form, report_family)
        @form = form
        @report_family = report_family
      end

      def call
        return broadcast(:invalid) if form.invalid?

        report_family.report_ids += [form.report_id]
        report_family.save!

        broadcast(:ok)
      end

      private

      attr_reader :form, :report_family
    end
  end
end
