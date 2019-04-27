# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class SubjectsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option || ::Threesixty::Option.new
        subjects = policy_scope(::Threesixty::Subject).where(campaign_id: threesixty_campaign.campaign_id).order(id: :desc).map do |s|
          nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(s)
          ::Threesixty::SubjectSerializer.new(s, option: option, nomination_requirement: nomination_requirement).to_h
        end

        render json: subjects
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

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject
      end
    end
  end
end
