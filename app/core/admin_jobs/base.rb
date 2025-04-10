# frozen_string_literal: true

module AdminJobs
  class Base < BaseCommand
    include ActionView::Helpers::TagHelper
    include ActionView::Context

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
        href: build_campaign_url,
        label: campaign.name
      }
    end

    def generate_details
      []
    end

    def valid?
      true
    end

    def file_link
      content_tag(:a, record.file.filename.to_s, href: record.file.url) if record.file.present?
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

    def client
      @client ||= Client.find_by(id: record.data['client_id'])
    end

    def build_campaign_url
      if campaign.threesixty?
        "/admin/clients/#{campaign.project.client.id}/projects/#{campaign.project_id}/" \
          "threesixty_campaigns/#{campaign.threesixty_campaign.id}"
      else
        "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}"
      end
    end
  end
end
