# frozen_string_literal: true

module Workshops
  class Update < BaseCommand
    private_attr_accessor :workshop, :params

    def initialize(workshop, params)
      @workshop = workshop
      @params = params
    end

    def call
      Workshop.transaction do
        @workshop.update!(params.slice(:name,
                                       :total_seats,
                                       :video_call_type,
                                       :allow_late_cancellation_and_rescheduling,
                                       :meeting_link))

        workshop.workshop_assessors.where.not(user_id: params[:workshop_assessors_ids]).destroy_all
        params[:workshop_assessors_ids].each do |assessor_user_id|
          @workshop.workshop_assessors.find_or_create_by!(user_id: assessor_user_id)
        end

        workshop.workshop_managers.where.not(user_id: params[:workshop_managers_ids]).destroy_all
        params[:workshop_managers_ids].each do |manager_user_id|
          @workshop.workshop_managers.find_or_create_by!(user_id: manager_user_id)
        end
      end

      broadcast :ok
    end
  end
end
