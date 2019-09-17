# frozen_string_literal: true

module Threesixty
  class MailHistorySerializer < ActiveModel::Serializer
    attributes :id, :status, :recipient, :subject, :scheduled_date, :emails_sent

    def status
      :success
    end

    def recipient
      recipient_criteria = object.recipient_criteria

      return User.find_by(id: recipient_ids.first)&.email if recipient_ids.count == 1

      subset_or_all = recipient_criteria.blank? ? 'All' : 'Subset of '

      return "#{subset_or_all} #{object.recipient_type.to_s.pluralize.capitalize}" if recipient_criteria.blank?
    end

    # TODO: Change this when we do bounce email tracking
    def emails_sent
      return '0/0' if recipient_ids.blank?

      "#{recipient_ids.count}/#{recipient_ids.count}"
    end

    private

    def recipient_ids
      Array.wrap(object.recipient_ids)
    end
  end
end
