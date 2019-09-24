# frozen_string_literal: true

module Threesixty
  class EmailScheduleSerializer < ActiveModel::Serializer
    attributes :id, :status, :recipient, :subject, :scheduled_date, :emails_sent, :delivered_at

    has_many :histories, serializer: Threesixty::EmailHistorySerializer

    # TODO: This will change
    def status
      object.delivered_at? ? :success : :undelivered
    end

    def recipient
      recipient_criteria = object.recipient_criteria

      return User.find_by(id: recipient_ids.first)&.email if recipient_ids.count == 1

      subset_or_all = recipient_criteria.blank? ? 'All' : 'Subset of '

      "#{subset_or_all} #{recipient_type.to_s.pluralize.capitalize}"
    end

    # TODO: Change this when we do bounce email tracking
    def emails_sent
      return '0/0' if recipient_ids.blank?

      "#{recipient_ids.count}/#{recipient_ids.count}"
    end

    def histories
      object.email_histories
    end

    private

    def recipient_ids
      Array.wrap(object.recipient_ids)
    end

    def recipient_type
      Threesixty::Emails::Name.recipient_type(object.name)
    end
  end
end
