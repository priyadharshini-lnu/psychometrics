# frozen_string_literal: true

module WorkshopSubjects
  class MetadataForFiltersFetcher < BaseCommand
    def initialize(current_user, filter: nil)
      @current_user = current_user
      @filter = filter
    end

    def call
      broadcast :ok, {
        campaigns: campaigns_data,
        slot_names: slot_names_data,
        attendance_statuses: attendance_statuses_data,
        scheduling_statuses: scheduling_statuses_data
      }
    end

    private

    attr_reader :current_user, :filter

    def campaigns_data
      subjects = scoped_subjects
      subjects = subjects.where(workshop_id: workshop_ids_in) if workshop_ids_in.present?

      Campaign.
        where(id: subjects.select(:campaign_id).distinct).
        pluck(:id, :name).
        map { |id, name| { id: id, name: name } }
    end

    def slot_names_data
      subjects = scoped_subjects
      subjects = subjects.where(campaign_id: campaign_ids_in) if campaign_ids_in.present?

      Workshop.
        where(id: subjects.select(:workshop_id).distinct).
        pluck(:id, :name).
        map { |id, name| { id: id, name: name } }
    end

    def attendance_statuses_data
      build_status_options(WorkshopSubject.attendance_statuses.keys)
    end

    def scheduling_statuses_data
      build_status_options(WorkshopSubject.scheduling_statuses.keys)
    end

    def build_status_options(statuses)
      statuses.map { |status| { value: status, label: status.humanize } }
    end

    def campaign_ids_in
      filter&.dig(:campaign_id_in)
    end

    def workshop_ids_in
      filter&.dig(:workshop_id_in)
    end

    def scoped_subjects
      @scoped_subjects ||= Api::Administration::WorkshopSubjectPolicy::Scope.new(
        current_user, WorkshopSubject
      ).resolve
    end
  end
end
