# frozen_string_literal: true

module Api
  class V2::Administration::AIScoreApprovalsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    def show
      score_data = ::Administration::AIScoreApprovalSerializer.new(context: { current_user: current_user }).
                   serialize(score_approval)

      render json: json_api_attributes(score_approval, score_data)
    end

    def approve_question
      audit! :approve_question, score_approval, payload: approve_question_params, campaign: score_approval.campaign
      ScoreApprovals::ApproveQuestion.call(score_approval, approve_question_params[:question_id], current_user) do
        on(:ok) do |scores|
          render json: Panko::ArraySerializer.new(
            scores,
            each_serializer: ::Administration::AIFactorScoreSerializer,
            context: { current_user: current_user }
          ).to_a
        end
        on(:error) do |error|
          render json: { error: error }, status: :unprocessable_entity
        end
      end
    end

    def approve_all_questions
      audit! :approve_all_questions, score_approval, campaign: score_approval.campaign
      ScoreApprovals::ApproveAllQuestions.call(score_approval, current_user) do
        on(:ok) do |_|
          render json: ::Administration::AIScoreApprovalSerializer.new(context: { current_user: current_user }).
            serialize(score_approval)
        end
        on(:error) do |error|
          render json: { error: error }, status: :unprocessable_entity
        end
      end
    end

    def override_score
      factor_score = score_approval.users_result.ai_factor_scores.find_by(id: override_score_params[:factor_score_id])
      return render json: { error: 'Factor score not found' }, status: :unprocessable_entity unless factor_score

      result = ScoreApprovals::OverrideScore.call(factor_score, override_score_params, current_user)

      audit! :override_score, score_approval, payload: override_score_params, campaign: score_approval.campaign

      return render json: { error: result[:error] }, status: :unprocessable_entity if result[:error]

      render json: serialize_factor_scores(result[:ok])
    end

    def discard_score
      factor_score = score_approval.users_result.ai_factor_scores.find_by(id: override_score_params[:factor_score_id])
      return render json: { error: 'Factor score not found' }, status: :unprocessable_entity unless factor_score

      result = ScoreApprovals::DiscardScore.call(factor_score, current_user)

      audit! :discard_score, score_approval, payload: { factor_score_id: override_score_params[:factor_score_id] },
                                              campaign: score_approval.campaign

      return render json: { error: result[:error] }, status: :unprocessable_entity if result[:error]

      render json: serialize_factor_scores(result[:ok])
    end

    def discard_question
      audit! :discard_question, score_approval, payload: discard_question_params, campaign: score_approval.campaign
      ScoreApprovals::DiscardQuestion.call(score_approval, discard_question_params[:question_id], current_user) do
        on(:ok) do |scores|
          render json: Panko::ArraySerializer.new(
            scores,
            each_serializer: ::Administration::AIFactorScoreSerializer,
            context: { current_user: current_user }
          ).to_a
        end
        on(:error) do |error|
          render json: { error: error }, status: :unprocessable_entity
        end
      end
    end

    def discard_all_questions
      audit! :discard_all_questions, score_approval, campaign: score_approval.campaign
      ScoreApprovals::DiscardAllQuestions.call(score_approval, current_user) do
        on(:ok) do |_|
          render json: ::Administration::AIScoreApprovalSerializer.new(context: { current_user: current_user }).
            serialize(score_approval)
        end
        on(:error) do |error|
          render json: { error: error }, status: :unprocessable_entity
        end
      end
    end

    def rescore
      AdminJob.call(:rescore_ai_scoring, {
        users_result_id: score_approval.users_result.id,
        campaign_id: score_approval.campaign_id
      }, current_user)

      audit! :rescore, score_approval, campaign: score_approval.campaign

      render json: :ok
    end

    def reset_approval
      ScoreApprovals::ResetApproval.call(score_approval, current_user) do
        on(:ok) do
          audit! :reset_approval, score_approval, campaign: score_approval.campaign
          render json: ::Administration::AIScoreApprovalSerializer.new(context: { current_user: current_user }).
            serialize(score_approval)
        end
        on(:error) do |error|
          render json: { error: error }, status: :unprocessable_entity
        end
      end
    end

    def bulk_approve
      approvals, meta = ScoreApprovals::BulkApprove.call!(params[:data][:attributes][:ids], current_user)

      audit! :bulk_approve, nil,
             record_type: AI::ScoreApproval,
             payload: { ids: params[:data][:attributes][:ids] }

      json = serialize_resources(approvals, ::Api::V2::Administration::AIScoreApprovalResource)
      json[:meta] = meta

      render json: json
    end

    def subject_assessment
      user_assessment = score_approval.as_user_assessment
      user_result = user_assessment.users_result
      selected_locale = user_assessment.selected_locale

      render json: {
        result: UsersResultSerializer.new(
          context: {
            campaign: user_assessment.campaign,
            participant: user_assessment,
            current_user: current_user,
            locale: selected_locale,
            piped_text_context: build_piped_context(user_assessment),
            include: '**'
          }
        ).serialize(user_result),

        assessment: AssessmentSerializer.new(
          context: {
            selected_locale: selected_locale,
            piped_text_context: build_piped_context(user_assessment),
            include: '**'
          }
        ).serialize(user_assessment.assessment)
      }
    end

    def metadata_for_filters
      response = ScoreApprovals::MetadataFetcher.call!(current_user, filter: params[:filter])

      render json: response
    end

    def model_class
      AI::ScoreApproval
    end

    def policy_class
      Api::Administration::AI::ScoreApprovalPolicy
    end

    def score_approval
      @score_approval ||= AI::ScoreApproval.includes(:project, :client, :subject, :users_result).find(params[:id])
    end

    def override_score_params
      params.require(:data).require(:attributes).permit(:factor_score_id, :score, :reason, :not_applicable)
    end

    def approve_question_params
      params.require(:data).require(:attributes).permit(:question_id)
    end

    def discard_question_params
      params.require(:data).require(:attributes).permit(:question_id)
    end

    def serialize_factor_scores(scores)
      scores.map { |score| ::Administration::AIFactorScoreSerializer.new(current_user: current_user).serialize(score) }
    end

    def build_piped_context(user_assessment)
      {
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject,
        campaign: user_assessment.campaign,
        result: user_assessment.users_result,
        assessment: user_assessment.assessment
      }
    end
  end
end
