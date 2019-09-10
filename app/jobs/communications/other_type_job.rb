# frozen_string_literal: true

module Communications
  class OtherTypeJob < ApplicationJob
    queue_as :communication

    def perform
      communications = Communication.other.specific_datetime.
                       joining { emails.outer }.where.has { emails.id.eq(nil) & (delivery_at <= Time.current) }.
                       group(:id)
      communications.find_each(batch_size: 10, &:emails_creating)
    end
  end
end
