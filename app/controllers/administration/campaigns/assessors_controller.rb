# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update show destroy spoof]

      def index
        assessors = campaign.assessors.ransack(params[:filters]).result
        paginated_assessors = assessors.page(params[:page])

        respond_to do |format|
          format.csv do
            user_assessment_by_subject_and_evaluator = UserAssessment.includes(:subject, :evaluator, :relationship).
                                                       where(
                                                         campaign_id: campaign.id,
                                                         relationships: { name: Relationship::ASSESSOR }
                                                       ).
                                                       group_by { |ua| [ua.subject_id, ua.evaluator_id] }
            headers['Content-Disposition'] = 'attachment; filename="assessors.csv"'
            headers['Content-Type'] ||= 'text/csv'
            render :index, locals: {
              user_assessment_by_subject_and_evaluator: user_assessment_by_subject_and_evaluator
            }
          end
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
        query = ::Assessors::AvailableAssessmentsQuery.new(client).query
        render json: query.select(:id, :name).map { |a| { id: a.id, name: a.name } }
      end

      def import
        assessors = ::Assessors::ParseImportData.call!(params[:import_data])
        form = ::Assessors::CreateAllForm.from_params(assessors: assessors).with_context(campaign: campaign)
        if form.valid?
          AdminJob.call(
            :import_assessors, { campaign_id: params[:new_campaign_id] }, current_user, params[:import_data]
          )
          render json: :ok
        else
          render json: { errors: form.errors.messages.map { |_k, v| v }.flatten }, status: 422
        end
      end

      def show
        render json: resource.user, serializer: Administration::Assessors::UserSerializer
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

      def spoof
        sign_in(resource.user)
        flash.now[:success] = t('.successfully', name: resource.user.decorate.display_name)
        redirect_to assessors_dashboard_path
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
