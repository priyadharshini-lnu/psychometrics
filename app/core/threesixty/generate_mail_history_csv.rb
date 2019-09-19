# frozen_string_literal: true

module Threesixty
  class GenerateMailHistoryCsv < BaseCommand
    private_attr_reader :email_schedule, :threesixty_campaign

    def initialize(email_schedule)
      @email_schedule = email_schedule
      @threesixty_campaign = @email_schedule.threesixty_campaign
    end

    def call
      csv_file = CSV.generate(headers: true) do |csv|
        csv << headers

        email_schedule.email_histories.includes(:subject, :evaluator).each do |email_history|
          csv << data(email_history)
        end
      end

      broadcast :ok, csv_file
    end

    private

    def data(email_history)
      return recipient_data(email_history.subject, email_history.status) if email_schedule.recipient_type == :subject

      recipient_data(email_history.evaluator, email_history) + subject_data(email_history)
    end

    def recipient_data(user, email_history)
      user = email_history.subject
      [
        user.id,
        user.first_name,
        user.last_name,
        user.email,
        email_history.status
      ]
    end

    def subject_data(email_history)
      subject = email_history.subject
      [
        relationship_hash[email_history.meta['relationship_id']],
        subject.first_name,
        subject.last_name,
        subject.email,
        subject.id
      ]
    end

    def headers
      return recipient_headers if email_schedule.recipient_type == :subject

      recipient_headers + subject_headers
    end

    def recipient_headers
      [
        'Id',
        'First Name',
        'Last Name',
        'Email',
        'Status'
      ]
    end

    def subject_headers
      [
        'Relationship',
        'Subject First Name',
        'Subject Last Name',
        'Subject Email',
        'Subject Id'
      ]
    end

    def relationship_hash
      @relationship_hash ||= Relationships::ByCampaign.call!(threesixty_campaign).pluck(:id, :name).to_h
    end
  end
end
