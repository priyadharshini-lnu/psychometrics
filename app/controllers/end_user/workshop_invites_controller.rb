# frozen_string_literal: true

class EndUser::WorkshopInvitesController < ApplicationController
  before_action :set_resource, only: %i[fetch_invite fetch_booking]

  def fetch_invite
    render json: @_resource, serializer: ::EndUser::IndividualInviteSerializer
  end

  def fetch_booking
    render json: @_resource, serializer: ::EndUser::IndividualBookingSerializer, current_user: current_user
  end

  def book
    form = Campaigns::Bookings::BookSlotForm.from_params(params.merge(current_user: current_user))

    if form.invalid?
      render json: { errors: form.errors.full_messages }, status: 400
    else
      response = Workshops::Booking::BookSlot.call(params, current_user)

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

      if response && response[:error]
        render json: { errors: response[:error] }, status: 400
      else
        render json: :ok
      end
    end
  end

  private

  def set_resource
    @_resource = WorkshopInvite.find(params[:id])
  end
end
