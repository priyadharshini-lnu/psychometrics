# frozen_string_literal: true

class EndUser::WorkshopInvitesController < ApplicationController
  before_action :set_resource, only: %i[fetch_invite fetch_booking book]

  def fetch_invite
    render json: ::EndUser::IndividualInviteSerializer.new(
      context: { current_user: current_user }
    ).serialize(@_resource)
  end

  def fetch_booking
    render json: ::EndUser::IndividualBookingSerializer.new(
      context: { current_user: current_user }
    ).serialize(@_resource)
  end

  def book
    form = Campaigns::Bookings::BookSlotForm.from_params(params.merge(current_user: current_user))

    if form.invalid?
      render json: { errors: form.errors.full_messages }, status: 400
    else
      response = Workshops::Booking::BookSlot.call(params, current_user)
      audit! :book, @_resource, project: @current_project, user: current_user, payload: params

      if response && response[:error]
        render json: { errors: response[:error] }, status: 400
      else
        render json: :ok
      end
    end
  end

  def cancel_or_request_cancellation
    form = Campaigns::Bookings::CancelSlotForm.from_params(params.merge(current_user: current_user))

    if form.invalid?
      render json: { errors: form.errors.full_messages }, status: 400
    else
      response = Workshops::Booking::CancelSlot.call(params, current_user)
      workshop = Workshop.find(params[:workshop_id])
      audit! :cancel_or_request_cancellation, workshop, project: @current_project, user: current_user, payload: params

      if response && response[:error]
        render json: { errors: response[:error] }, status: 400
      else
        render json: :ok
      end
    end
  end

  def reschedule_or_request_reschedule
    form = Campaigns::Bookings::RescheduleSlotForm.from_params(params.merge(current_user: current_user))

    if form.invalid?
      render json: { errors: form.errors.full_messages }, status: 400
    else
      response = Workshops::Booking::RescheduleSlot.call(params, current_user)
      workshop = Workshop.find(params[:workshop_id])
      audit! :reschedule_or_request_reschedule, workshop, project: @current_project, user: current_user,
        payload: params

      if response && response[:error]
        render json: { errors: response[:error] }, status: 400
      else
        render json: :ok
      end
    end
  end

  def download_ical
    workshop = Workshop.find_by(id: params[:workshop_id])
    return render plain: I18n.t('errors.workshop.missing_or_invalid'), status: :bad_request unless workshop

    result = Workshops::GenerateIcal.call(workshop, current_user)

    if result[:ok]
      send_data result[:ok],
                filename: 'event.ics',
                type: 'text/calendar; charset=utf-8'
    else
      render plain: I18n.t('errors.workshop.ical_generation_failed'), status: :unprocessable_entity
    end
  end

  private

  def set_resource
    @_resource = WorkshopInvite.find(params[:id])
  end
end
