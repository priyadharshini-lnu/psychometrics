# frozen_string_literal: true

module Workshops
  class CreateAll < BaseCommand
    private_attr_accessor :workshops, :campaign_id, :new_workshops

    def initialize(workshops, campaign_id)
      @workshops = workshops
      @campaign_id = campaign_id
      @new_workshops = []
    end

    def call
      failed_index = nil
      Workshop.transaction do
        workshops.each_with_index do |workshop_data, index|
          create_workshop_and_resources(workshop_data)
        rescue ActiveRecord::RecordInvalid, ActiveRecord::NotNullViolation => e
          failed_index = index
          Sentry.capture_exception(e)
          raise ActiveRecord::Rollback
        end
      end

      if failed_index.nil?
        broadcast(:ok, { workshops: new_workshops })
      else
        broadcast(:error, { title: failed_index, detail: I18n.t('administration.errors.error_msg') })
      end
    end

    def create_workshop_and_resources(workshops_data)
      workshop = create_workshop(workshops_data.merge!(campaign_id: campaign_id))
      create_workshop_resources(workshop.id, workshops_data[:workshop_resources])
      create_workshop_assessors(workshop, workshops_data[:assessor_ids])
      create_workshop_managers(workshop, workshops_data[:center_manager_ids])
    end

    def create_workshop(workshop_data)
      data = workshop_data.slice(
        :timezone, :duration, :cancellation_lead_time, :scheduling_lead_time, :name,
        :video_call_type, :start_time, :campaign_id, :total_seats, :meeting_link,
        :allow_late_cancellation_and_rescheduling
      )
      workshop = Workshop.create!(data)
      new_workshops << workshop
      workshop
    end

    def create_workshop_resources(workshop_id, resources_data)
      resources_data.each do |workshop_resource|
        WorkshopResource.create!(
          name: workshop_resource[:name],
          url: workshop_resource[:url],
          workshop_id: workshop_id
        )
      end
    end

    def create_workshop_assessors(workshop, assessor_user_ids)
      assessor_user_ids&.each do |assessor_user_id|
        workshop.workshop_assessors.find_or_create_by!(user_id: assessor_user_id)
      end
    end

    def create_workshop_managers(workshop, manager_user_ids)
      manager_user_ids&.each do |manager_user_id|
        workshop.workshop_managers.find_or_create_by!(user_id: manager_user_id)
      end
    end
  end
end
