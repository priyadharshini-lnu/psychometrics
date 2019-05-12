# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class SubjectsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit update destroy spoof]
      append_before_action :pundit_authorize

      def index
        subjects = policy_scope(::Threesixty::Subject).includes(:evaluator, :user).where(campaign_id: threesixty_campaign.campaign_id).order(id: :desc).map do |s|
          serialize(s)
        end

        render json: subjects
      end

      def search
        users = ::Threesixty::Subjects::UsersQuery.new(threesixty_campaign.campaign, params[:q]).query.map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
        render json: users
      end

      def update
        resource.update!(resource_params)
        render json: serialize(resource)
      end

      def destroy
        resource.destroy!
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

      def spoof
        if resource.user.is?(:superadmin, :project_admin)
          sign_in(resource.user)
        else
          spoof_token = SecureRandom.urlsafe_base64(64)
          resource.user.update_column(:spoof_token, spoof_token)
          redirect_url = root_url(domain: Settings.domain, subdomain: resource.project.try(:subdomain), spoof_token: spoof_token)
        end
        redirect_url ||= administration_root_path
        flash.now[:success] = t('.successfully', name: resource.user.decorate.display_name)
        redirect_to redirect_url
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject
      end

      def resource_params
        params.require(:subject).permit(:report_release_status, :report_approval_status, :evaluation_status)
      end

      def serialize(subject)
        nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(subject)
        ::Threesixty::SubjectSerializer.new(
          subject,
          option: threesixty_campaign.option,
          nomination_requirement: nomination_requirement
        ).to_h
      end
    end
  end
end
