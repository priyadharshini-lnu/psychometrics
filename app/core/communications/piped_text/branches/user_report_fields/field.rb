# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module UserReportFields
        class Field < ::PipedText::BaseField
          def call
            method = possible_fields[path.last]
            broadcast :ok, method ? send(method) : ''
          end

          private

          def user_report
            context[:user_report]
          end

          def report_name
            user_report.report.try(:name)
          end

          def possible_fields
            {
              'ReportName' => :report_name
            }
          end
        end
      end
    end
  end
end
