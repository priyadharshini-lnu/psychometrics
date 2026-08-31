# frozen_string_literal: true

module Communications
  module Deliveries
    class TickJob < ApplicationJob
      queue_as :communication

      def perform
        CommunicationDelivery.where(delivery_rule: :specific_datetime, last_ran_at: nil).
          where.not(status: %i[cancelled failed]).
          where('delivery_at <= ?', Time.current).
          find_each { |delivery| Communications::Deliveries::DispatchJob.perform_later(delivery.id) }
      end
    end
  end
end
