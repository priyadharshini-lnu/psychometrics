# frozen_string_literal: true

module AdminJobs
  class Base < BaseCommand
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    private_attr_reader :record, :owner, :stage

    class_attribute :steps, default: [], instance_writer: false

    def self.inherited(subclass)
      super
      subclass.steps = []
    end

    def initialize(record, stage = nil)
      @record = record
      @owner = record.owner
      @stage = stage
    end

    def perform_multisteps
      stage = find_step(@stage)

      subjob_record = AdminJobRecord.create!(operation: record.operation,
                                             data: record.data,
                                             step: stage[:name],
                                             weight: stage[:options][:weight],
                                             owner: owner,
                                             parent_job: record)
      job = stage[:klass]
      job.perform_now(subjob_record)

      broadcast :waiting
    end

    def call
      steps.empty? ? super : perform_multisteps
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

    def owner_country
      record.data['owner_country']
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

      def preloaded_campaigns
        Thread.current[:admin_job_preloaded_campaigns] || {}
      end

      def preload_campaigns_for(records)
        campaign_ids = records.filter_map { |r| r.data['campaign_id'].to_i.nonzero? }.uniq
        Thread.current[:admin_job_preloaded_campaigns] = Campaign.where(id: campaign_ids).index_by(&:id)
        yield
      ensure
        Thread.current[:admin_job_preloaded_campaigns] = nil
      end

      def step(name, klass, options = {})
        steps << { name: name, klass: klass, options: options }
      end

      def next_step(step)
        step_index = steps.index { |s| s[:name] == step.to_sym }
        return nil unless step_index

        next_step_index = step_index + 1
        steps[next_step_index] if next_step_index < steps.length
      end

      def validate(_data, _owner)
        nil
      end
    end

    def build_download_content(bulk_report)
      download_urls = bulk_report.public_download_urls

      [
        content_tag(:div, I18n.t('admin_jobs.bulk_download_reports.content.title')),
        content_tag(:ul) do
          bulk_report.files.map.with_index do |file, index|
            content_tag(:li) do
              content_tag(:a, file.filename.to_s, href: download_urls[index])
            end
          end.join.html_safe
        end
      ].join.html_safe
    end

    private

    def find_step(name)
      name ? steps.find { |step| step[:name] == name.to_sym } : steps.first
    end

    def campaign
      @campaign ||= self.class.preloaded_campaigns[record.data['campaign_id'].to_i] ||
                    Campaign.find_by(id: record.data['campaign_id'])
    end

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end

    def client
      @client ||= Client.find_by(id: record.data['client_id'])
    end

    def build_campaign_url
      "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}"
    end

    def dimension_factors_url(dimension_id)
      if Settings.features.dimensions_react_ui
        "/admin/dimensions/#{dimension_id}/factors"
      else
        "/administration/dimensions/#{dimension_id}/factors"
      end
    end
  end
end
