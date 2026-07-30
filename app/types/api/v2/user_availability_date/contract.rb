# frozen_string_literal: true

module Api
  module V2
    module UserAvailabilityDate
      class Contract < Api::Base::Contract
        config.messages.namespace = :user_availability_date

        schema Api::V2::UserAvailabilityDate::Schema.create_request

        rule(data: { attributes: :timezone }) do
          normalized_tz = TimezoneHelper.normalize(value)
          unless ActiveSupport::TimeZone[normalized_tz]
            key.failure(:not_in_the_list?)
          end
        end

        # Validates overlaps with another schedule user_availability_date
        rule(data: { attributes: :start_date }) do
          overlapping_availability = ::UserAvailabilityDate.where(user: _context[:current_user])
          existing_record_id = values.dig(:data, :id)
          overlapping_availability = overlapping_availability.where.not(id: existing_record_id) if existing_record_id
          overlapping_availability = overlapping_availability.find_by(
            '(start_date, end_date) OVERLAPS (?, ?)', value, values.dig(:data, :attributes, :end_date)
          )
          next unless overlapping_availability

          start_date = overlapping_availability.start_date
          end_date = overlapping_availability.end_date
          # rubocop:disable Layout/LineLength
          key.failure(
            :overlaps_date,
            range: "(#{start_date.strftime("#{start_date.day.ordinalize} %B %Y")} - #{end_date.strftime("#{end_date.day.ordinalize} %B %Y")})"
          )
          # rubocop:enable Layout/LineLength
        end

        # Validates start_date less than end_date
        rule(data: { attributes: :start_date }) do
          start_date = values.dig(:data, :attributes, :start_date)
          end_date = values.dig(:data, :attributes, :end_date)
          next if Date.parse(start_date) <= Date.parse(end_date)

          key.failure(:start_date_should_be_less)
        end

        # Validates start_time less than end_time
        rule(data: { attributes: :availability_days }).each do |index:|
          if format_time(value[:start_time]) >= format_time(value[:end_time])
            key([:data, :attributes, :availability_days, index]).failure(:start_time_should_be_less)
          end
        end

        # Validate overlapping time interval
        rule(data: { attributes: :availability_days }) do
          values_with_index = value.map.with_index { |day, index| day.merge(index: index) }
          grouped_by_day = values_with_index.group_by { |day| day[:day] }
          values_with_index.each do |availability_day|
            day1_range = format_time(availability_day[:start_time])..format_time(availability_day[:end_time])
            compare_with_time_ranges = grouped_by_day[availability_day[:day]]
            compare_with_time_ranges.each do |other_day|
              next if other_day[:index] == availability_day[:index]

              day2_range = format_time(other_day[:start_time])..format_time(other_day[:end_time])
              next unless day1_range.overlaps?(day2_range)

              key([:data, :attributes, :availability_days, availability_day[:index]]).failure(
                :overlaps_time,
                interval: "#{day2_range.first.strftime('%I:%M %p')} - #{day2_range.last.strftime('%I:%M %p')}"
              )
            end
          end
        end

        def format_time(value)
          Time.strptime(value, '%H:%M')
        end
      end
    end
  end
end
