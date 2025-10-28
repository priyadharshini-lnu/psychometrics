# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluatorsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option
        query = policy_scope(::Threesixty::Evaluator).
                includes(user: { user_profile: { photo_attachment: :blob } }, self_subject: :user).
                where(campaign_id: threesixty_campaign.campaign_id).
                where(
                  'users.first_name ILIKE ? OR users.last_name ILIKE ? OR users.email ILIKE ?',
                  "%#{params[:q]}%", "%#{params[:q]}%", "%#{params[:q]}%"
                ).
                references(:user).
                order(id: :desc)
        evaluators = query.page(params[:page])
        counters = ::Threesixty::Participants::CalcCounters.call!(evaluators.map(&:user_id), threesixty_campaign)
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          evaluators.map(&:user_id),
          threesixty_campaign
        )
        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          evaluators.map(&:user),
          threesixty_campaign
        )
        total = query.count

        evaluators = Panko::ArraySerializer.new(
          evaluators,
          each_serializer: ::Threesixty::EvaluatorSerializer,
          context: {
            option: option,
            nomination_requirement: nomination_requirement_by_user_id[evaluators.pluck(:user_id)],
            counters: counters,
            subject_evaluator_counters: subject_evaluator_counters,
            current_user: current_user,
            project_id: threesixty_campaign.campaign.project_id,
            campaign_id: threesixty_campaign.campaign_id
          }
        ).to_a

        render json: { evaluators: evaluators, total: total, permissions: permissions }
      end

      def create_all
        validate_and_add_evaluators(params)
      end

      def download_example_import_file
        send_file(
          Rails.public_path.join('example_csv/evaluator_import.csv'),
          type: 'text/csv'
        )
      end

      def import
        form = ::Threesixty::Evaluators::ImportFileForm.from_params(params).
               with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          evaluators = evaluators_from_csv(form.file)
          validate_and_add_evaluators(evaluators: evaluators)
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      private

      def permissions
        GetPermissionsHash.call!(
          Administration::Threesixty::EvaluatorPolicy,
          current_user,
          nil,
          [
            %w[add_evaluator create_all],
            %w[import_evaluator import],
            'manage_datasheets',
            'export_results',
            'export_completion_status',
            'reset_all_participants',
            'reset_all_nominations'
          ],
          {
            project_id: threesixty_campaign.campaign.project_id,
            campaign_id: threesixty_campaign.campaign_id
          }
        )
      end

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def validate_and_add_evaluators(evaluators)
        form = ::Threesixty::Evaluators::CreateAllForm.from_params(evaluators).
               with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          result = ::Threesixty::Evaluators::CreateAll.call!(form.evaluators_with_relations,
                                                             threesixty_campaign, current_user)
          render json: result.slice(:existing_evaluators_whose_password_not_changed)
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def evaluators_from_csv(file)
        csv_result = ::CsvFileParser.call!(file, headers: :first_row)
        csv_result.map { |row| row.to_h.symbolize_keys }
      end
    end
  end
end
