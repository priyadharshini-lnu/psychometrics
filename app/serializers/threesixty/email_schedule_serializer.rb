# frozen_string_literal: true

module Threesixty
  class EmailScheduleSerializer < Panko::Serializer
    attributes :id, :status, :recipient, :subject, :scheduled_date, :emails_sent, :delivered_at, :histories

    # TODO: This will change
    def status
      object.delivered_at? ? :success : :undelivered
    end

    def subject
      object.subject.presence || object.template&.subject
    end

    def recipient
      recipient_criteria = object.recipient_criteria

      return user_email(recipient_ids.first) if recipient_ids.count == 1

      subset_or_all = recipient_criteria.blank? ? 'All' : 'Subset of '

      "#{subset_or_all} #{recipient_type.to_s.pluralize.capitalize}"
    end

    # TODO: Change this when we do bounce email tracking
    def emails_sent
      return '0/0' if recipient_ids.blank?

      "#{recipient_ids.count}/#{recipient_ids.count}"
    end

    def histories
      Panko::ArraySerializer.new(
        object.email_histories,
        each_serializer: Threesixty::EmailHistorySerializer
      ).to_a
    end

    private

    def recipient_ids
      Array.wrap(object.recipient_ids)
    end

    def recipient_type
      Threesixty::Emails::Name.recipient_type(object.name)
    end

    def user_email(id)
      context[:users_hash][id]
    end
  end
end
