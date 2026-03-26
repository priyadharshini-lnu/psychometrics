# frozen_string_literal: true

module Communications
  class OtherTypeJob < ApplicationJob
    def perform
      communications = Communication.other.specific_datetime.
                       where.missing(:emails).
                       where('communications.delivery_at <= ?', Time.current).
                       group(:id)
      communications.find_each(batch_size: 10, &:emails_creating)
    end
  end
end
