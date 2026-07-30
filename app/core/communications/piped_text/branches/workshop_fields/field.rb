# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module WorkshopFields
        class Field < ::PipedText::BaseField
          include ActionView::Helpers::DateHelper

          def call
            method = possible_fields[path.last]

            broadcast :ok, method ? send(method) : ''
          end

          private

          def workshop
            context[:workshop]
          end

          def start_time
            format_time(workshop.start_time)
          end

          def end_time
            format_time(workshop.end_time)
          end

          def duration
            distance_of_time_in_words(
              workshop.start_time, workshop.end_time
            )
          end

          def possible_fields
            {
              'StartTime' => :start_time,
              'EndTime' => :end_time,
              'Duration' => :duration
            }
          end

          def format_time(time)
            tzid = TimezoneHelper.normalize(workshop.timezone)
            time = time.in_time_zone(tzid)
            return I18n.l(time, format: :with_time_zone) unless params['format']

            time.strftime(params['format'])
          end
        end
      end
    end
  end
end
