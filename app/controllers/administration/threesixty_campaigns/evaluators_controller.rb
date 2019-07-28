# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EvaluatorsController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        option = threesixty_campaign.option
        evaluators = policy_scope(::Threesixty::Evaluator).
                     includes(:user, self_subject: :user).
                     where(campaign_id: threesixty_campaign.campaign_id).
                     order(id: :desc).
                     page(params[:page])
        counters = ::Threesixty::Participants::CalcCounters.call!(evaluators.map(&:user_id), threesixty_campaign)
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          evaluators.map(&:user_id),
          threesixty_campaign
        )
        nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
          evaluators.map(&:user),
          threesixty_campaign
        )
        total = policy_scope(::Threesixty::Evaluator).where(campaign_id: threesixty_campaign.campaign_id).count

        evaluators = evaluators.map do |e|
          ::Threesixty::EvaluatorSerializer.new(
            e,
            option: option,
            nomination_requirement: nomination_requirement_by_user_id[e.user_id],
            counters: counters,
            subject_evaluator_counters: subject_evaluator_counters
          ).to_h
        end
        render json: { evaluators: evaluators, total: total }
      end

      def create_all
        validate_and_add_evalutors(params)
      end

      def download_example_import_file
        send_file(
          "#{Rails.root}/public/example_csv/evaluator_import.csv",
          type: "text/csv"
        )
      end

      def import
        form = ::Threesixty::Evaluators::ImportFileForm.from_params(params).with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          evaluators = evalutors_from_csv(form.file.path)
          validate_and_add_evalutors({evaluators: evaluators })
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Evaluator
      end

      def validate_and_add_evalutors(evaluators)
        form = ::Threesixty::Evaluators::CreateAllForm.from_params(evaluators).
          with_context(campaign: threesixty_campaign.campaign)
        if form.valid?
          ::Threesixty::Evaluators::CreateAll.call!(form.evaluators_with_relations, threesixty_campaign)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def evalutors_from_csv(file_path)
        csv = CSV.read(file_path, 'r:bom|utf-8', headers: true)
        subjects = csv.map { |row| row.to_h.symbolize_keys }
      end
    end
  end
end
