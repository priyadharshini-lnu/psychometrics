# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorsController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[update show destroy spoof]

      def index
        assessors = campaign.assessors.ransack(params[:filters]).result.preload(:user)
        paginated_assessors = assessors.page(params[:page])

        # rubocop:disable Metrics/BlockLength
        respond_to do |format|
          format.csv do
            user_assessment_by_subject_and_evaluator = UserAssessment.includes(:subject, :evaluator, :relationship).
                                                       where(
                                                         campaign_id: campaign.id,
                                                         relationships: { name: Relationship::ASSESSOR }
                                                       ).
                                                       group_by { |ua| [ua.subject_id, ua.evaluator_id] }
            audit! :export_asessors, campaign, campaign: campaign
            headers['Content-Disposition'] = 'attachment; filename="assessors.csv"'
            headers['Content-Type'] ||= 'text/csv'
            render :index, locals: {
              user_assessment_by_subject_and_evaluator: user_assessment_by_subject_and_evaluator
            }
          end
          format.json do
            serialized_assessors = Panko::ArraySerializer.new(
              paginated_assessors,
              each_serializer: Administration::Campaigns::AssessorSerializer,
              context: {
                current_user: current_user,
                campaign_id: campaign.id,
                project_id: campaign.project_id,
                evalutions_count: ::Assessors::EvaluationsCount.call!(paginated_assessors.pluck(:user_id), campaign)
              }
            ).to_a
            render json: { list: serialized_assessors, total: assessors.count, permissions: permissions }
          end
        end
        # rubocop:enable Metrics/BlockLength
      end

      def permissions
        GetPermissionsHash.call!(
          Administration::Campaigns::AssessorPolicy,
          current_user,
          nil,
          [
            %w[export index],
            'import',
            %w[add create_all]
          ],
          {
            project_id: campaign.project_id,
            campaign_id: campaign.id
          }
        )
      end

      def create_all
        form = ::Assessors::CreateAllForm.from_params(params).with_context(campaign: campaign)
        if form.valid?
          audit! :create_campaign_assessor, campaign, payload: params, campaign: campaign
          ::Assessors::CreateAll.call!(form.assessors, campaign, current_user)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def available_assessments
        query = ::Assessors::AvailableAssessmentsQuery.new(client).query
        render json: query.select(:id, :name).order(:name).map { |a| a.slice(:id, :name) }
      end

      def lead_assessor_assessment
        render json: campaign.lead_assessor_assessment&.slice(:id, :name)
      end

      def import
        assessors = ::Assessors::ParseImportData.call!(params[:import_data])
        form = ::Assessors::CreateAllForm.from_params(assessors: assessors).with_context(campaign: campaign)
        if form.valid?
          audit! :import_asessors, campaign, campaign: campaign
          AdminJob.call(
            :import_assessors, { campaign_id: params[:new_campaign_id] }, current_user, params[:import_data]
          )
          render json: :ok
        else
          render json: { errors: form.errors.messages.map { |_k, v| v }.flatten }, status: 422
        end
      end

      def show
        render json: Administration::Assessors::UserSerializer.new(
          context: {
            project_id: campaign.project_id, campaign_id: campaign.id, current_user: current_user
          }
        ).serialize(resource.user)
      end

      def create
        throw 'Not implemented yet'
      end

      def update
        throw 'Not implemented yet'
      end

      def destroy
        audit! :destroy, resource, payload: { id: resource.id }, campaign: campaign
        ::Assessors::Remove.call!(resource)

        render json: resource.id
      end

      def spoof
        target_user = resource.user
        audit! :sign_in_as, target_user, payload: { id: target_user.id, sign_in_as: target_user.email },
               campaign: campaign
        siem_log_impersonation_event(target_user, 'Admin')

        flash.now[:success] = t('.successfully', name: target_user.decorate.display_name)
        spoof_admin_routing(target_user, client: campaign.project.parent,
                            fallback_redirect_url: assessors_dashboard_path)
      end

      private

      def pundit_authorize
        authorize(
          resource || Assessor,
          nil,
          project_id: campaign.project_id,
          campaign_id: campaign.id,
          policy_class: Administration::Campaigns::AssessorPolicy
        )
      end

      def resource_class
        Assessor
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= campaign.assessors.find(params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end
