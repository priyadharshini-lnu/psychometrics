# frozen_string_literal: true

module Threesixty
  class NominationsController < ApplicationController
    include ::Threesixty::InitialState
    layout 'layouts/end_user'
    before_action :set_campaign
    before_action :set_subject
    initial_state_for [:show]

    def show
      authorize @subject
      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
        format.json do
          render json: Threesixty::NominationSerializer.new(
            include: '**',
            context: {
              current_user: current_user
            }
          ).serialize(@subject)
        end
      end
    end

    def search_evaluators
      render json: Panko::ArraySerializer.new(
        Threesixty::Evaluators::SearchQuery.
        new(@campaign.campaign, @subject, params[:q]).query,
        each_serializer: UserSerializer
      ).to_a
    end

    def request_approval
      last_email_sent_date = ::Threesixty::Emails::GetLastEmailSentAtForUser.
                             call!(@campaign, Threesixty::Emails::Name::REQUEST_APPROVAL, @subject.user_id)

      if !last_email_sent_date || last_email_sent_date.advance(hours: 1) < Time.zone.now
        email_schedule = Threesixty::Emails::Send.call!(Threesixty::Emails::Name::REQUEST_APPROVAL,
                                                        threesixty_campaign: @campaign, subject: @subject,
                                                        scheduled_date: 20.seconds.ago)
        ::Threesixty::Emails::SendSingleScheduledEmail.call!(email_schedule)
        render json: :ok
      else
        last_sent_at = last_email_sent_date.strftime(I18n.t('time.formats.datetimepicker_server'))
        wait_time = ActionController::Base.helpers.time_ago_in_words(last_email_sent_date.advance(hours: 1))
        render json: {
                 errors: I18n.t('nominations.approval_email_error', last_sent_at: last_sent_at, wait_time: wait_time)
               },
               status: 400
      end
    end

    def send_evaluator_reminders
      Threesixty::Emails::Send.
        call!(Threesixty::Emails::Name::EVALUATOR_REMINDER, threesixty_campaign: @campaign, subject: @subject)
      render json: :ok
    end

    def update_status
      authorize @subject
      participants = @subject.participants.where(manager_nomination_status: :waiting)
      participant_list = participants.to_a
      participants.update_all(manager_nomination_status: params[:status])
      participant_list.each do |participant|
        send_evaluator_invite_email(participant) if params[:status] == 'approved'
        send_nomination_denied_email(participant) if params[:status] == 'denied'
      end

      render json: Threesixty::NominationSerializer.new(
        include: '**'
      ).serialize(@subject)
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id] || params[:id])
    end

    def send_evaluator_invite_email(participant)
      return unless @campaign.option.messages['send_invite_to_new_evaluator']

      Threesixty::Emails::Send.call!(
        Threesixty::Emails::Name::EVALUATOR_INVITE,
        threesixty_campaign: @campaign,
        subject: @subject,
        evaluator: participant.threesixty_evaluator
      )
    end

    def send_nomination_denied_email(participant)
      ::Threesixty::Emails::Send.call!(
        ::Threesixty::Emails::Name::NOMINATION_DENIED,
        threesixty_campaign: @campaign,
        subject: participant.threesixty_subject,
        evaluator: participant.threesixty_evaluator
      )
    end
  end
end
