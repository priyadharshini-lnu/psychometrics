# frozen_string_literal: true

module AdminJobs
  class Base < BaseCommand
    private_attr_reader :record, :owner

    def initialize(record)
      @record = record
      @owner = record.owner
    end

    def job_record
      @record
    end

    def generate_title_link
      return {} unless campaign

      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}",
        label: campaign.name
      }
    end

    def generate_details
      []
    end

    def valid?
      true
    end

    class << self
      def generate_title_link(record)
        new(record).generate_title_link
      end

      def generate_details(record)
        new(record).generate_details
      end

      def valid?(record)
        new(record).valid?
      end
    end

    private

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end
