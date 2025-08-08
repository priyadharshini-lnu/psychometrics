# frozen_string_literal: true

module Api
  module V2
    module Workshop
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :update_workshop
        schema Api::V2::Workshop::Schema.update_request

        rule(data: { attributes: :total_seats }) do
          workshop_id = _context[:params][:id]

          key.failure(:less_than_booked) if ::Workshop.find(workshop_id).booked_seats > value
        end

        rule(data: { attributes: :start_time }) do
          next if _context[:params][:data][:attributes][:start_time].blank?

          workshop_id = _context[:params][:id]
          workshop = ::Workshop.find(workshop_id)

          next if DateTime.parse(_context[:params][:data][:attributes][:start_time]) == workshop.start_time

          key.failure(:bookings_exist) if workshop.booked_seats.positive?
        end
      end
    end
  end
end
