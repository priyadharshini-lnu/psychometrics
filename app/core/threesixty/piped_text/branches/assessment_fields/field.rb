# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module AssessmentFields
        class Field < ::PipedText::BaseField
          def call
            key = path.second
            mapped_key = possible_fields[key]

            return broadcast :ok, nil unless mapped_key

            value = get_field_value(mapped_key)
            broadcast :ok, value
          end

          private

          def get_field_value(mapped_key)
            if mapped_key == :total_time_allowed
              get_total_time_allowed
            elsif mapped_key == :time_taken
              get_time_taken
            end
          end

          def get_total_time_allowed
            assessment = context[:users_result].assessment
            return nil unless assessment&.extra&.dig('timer')

            format_duration(assessment.extra['timer'])
          end

          def get_time_taken
            user_assessment = context[:users_result].user_assessment
            return nil unless user_assessment&.started_at && user_assessment.completed_at

            time_taken_in_seconds = (user_assessment.completed_at - user_assessment.started_at).to_i
            format_duration(time_taken_in_seconds)
          end

          def possible_fields
            {
              'totalTimeAllowed' => :total_time_allowed,
              'timeTaken' => :time_taken
            }
          end

          def format_duration(total_seconds)
            return nil if total_seconds.nil? || total_seconds <= 0

            hours = total_seconds / 3600
            minutes = (total_seconds % 3600) / 60
            seconds = total_seconds % 60

            parts = []
            parts << "#{hours}h" if hours.positive?
            parts << "#{minutes}m" if minutes.positive?
            parts << "#{seconds}s" if seconds.positive?

            parts.empty? ? nil : parts.join(' ')
          end
        end
      end
    end
  end
end
