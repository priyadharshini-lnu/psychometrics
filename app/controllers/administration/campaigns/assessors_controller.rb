# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update show destroy]

      def index
        assessors = campaign.assessors.ransack(params[:filters]).result
        paginated_assessors = assessors.page(params[:page])

        respond_to do |format|
          format.json do
            serialized_assessors = ActiveModelSerializers::SerializableResource.new(
              paginated_assessors,
              each_serializer: Administration::Campaigns::AssessorSerializer,
              campaign_id: campaign.id,
              evalutions_count: ::Assessors::EvaluationsCount.call!(paginated_assessors.pluck(:user_id), campaign)
            )

            render json: {
              list: serialized_assessors,
              total: assessors.count
            }
          end
        end
      end

      def create_all
        form = ::Assessors::CreateAllForm.from_params(params).with_context(campaign: campaign)
        if form.valid?
          ::Assessors::CreateAll.call!(form.assessors, campaign, current_user)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def available_assessments
        render json: Assessment.assessor_form.
          select(:id, :name).
          where("owner_id is NULL OR owner_id = #{client.id}").map { |a| { id: a.id, name: a.name } }
      end

      def import
        throw 'Not implemented yet'
      end

      def show
        throw 'Not implemented yet'
      end

      def create
        throw 'Not implemented yet'
      end

      def update
        throw 'Not implemented yet'
      end

      def destroy
        ::Assessors::Remove.call!(resource)

        render json: resource.id
      end

      private

      def pundit_authorize
        authorize(resource || Assessor, nil, policy_class: Administration::Campaigns::AssessorPolicy)
      end

      def resource_class
        Assessor
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= policy_scope(Assessor, policy_scope_class: Administration::Campaigns::AssessorPolicy::Scope).
                       find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end
