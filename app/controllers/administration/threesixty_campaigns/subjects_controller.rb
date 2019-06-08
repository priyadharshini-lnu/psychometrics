# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class SubjectsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit update destroy spoof preview_report]
      append_before_action :pundit_authorize

      def index
        subjects = policy_scope(::Threesixty::Subject).
          includes(:evaluator, :user).
          where(campaign_id: threesixty_campaign.campaign_id).
          order(id: :desc).
          limit(params[:limit]).
          offset(params[:offset]).
          all
        subjects = ::Threesixty::Subjects::Serialize.call!(subjects, threesixty_campaign)
        total = policy_scope(::Threesixty::Subject).where(campaign_id: threesixty_campaign.campaign_id).count
        render json: { subjects: subjects, total: total }
      end

      def search
        users = ::Threesixty::Subjects::UsersQuery.new(threesixty_campaign.campaign, params[:q]).query.map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
        render json: users
      end

      def update
        resource.update!(resource_params)
        render json: ::Threesixty::Subjects::Serialize.call!([resource], threesixty_campaign).first
      end

      def destroy
        ::Threesixty::Subjects::Remove.call!(resource, threesixty_campaign)
        render json: :ok
      end

      def create_all
        form = ::Threesixty::Subjects::CreateAllForm.from_params(params).with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          ::Threesixty::Subjects::CreateAll.call!(form.subjects, threesixty_campaign)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def preview_report
        user_report = UsersReport.find_by!(campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id)

        @data = ::Reports::PrepareDataForReport.call!({
          users_report: user_report,
          locale: user_locale,
          current_user: current_user
        })
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject
      end

      def resource_params
        params.require(:subject).permit(:report_release_status, :report_approval_status, :evaluation_status)
      end
    end
  end
end
