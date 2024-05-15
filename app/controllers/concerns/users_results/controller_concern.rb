# frozen_string_literal: true

module UsersResults::ControllerConcern
  extend ActiveSupport::Concern

  included do
    before_action :set_user_result, only: %i[update upload_media_url remove_media update_meta_data
                                             complete_multipart_upload mark_as_user_selected_take]
  end

  def update
    if @user_assessment.evaluation_session_id == params[:evaluation_session_id]
      result_params = ::UsersResults::ExtendResourceParams.call!(
        resource_params.to_h,
        params[:question_ids],
        user_assessment
      )

      form = ::UsersResults::UpdatingForm.from_params(result_params)
      progress_was_reseted = user_assessment.progress_reseted
      ::UsersResults::UpdateUsersResult.call(form, @users_result, current_user)
    end

    render json: @users_result,
           serializer: UsersResultUpdateSerializer,
           current_block_id: params[:current_block_id],
           current_user: current_user,
           threesixty_campaign: @users_result.campaign.threesixty_campaign,
           campaign: @users_result.campaign,
           locale: current_user.locale,
           progress_was_reseted: progress_was_reseted
  end

  def update_meta_data
    @users_result.update!(meta_data_params)
    head :no_content
  end

  def upload_media_url
    MediaResponses::GetUploadUrl.call(@users_result, params[:question_id], params[:file_name]) do
      on(:ok) { |data| render json: data }
      on(:error) do |error|
        render json: {
          error: error
        }, status: 400
      end
    end
  end

  def upload_callback
    media = MediaResponse.find(params[:media_id])
    media.asset_key = params[:asset_key]
    if media.save
      render json: MediaResponseSerializer.new.serialize(media.reload)
    else
      error_message = media.errors.messages.values.join(',')
      media.destroy
      render json: { error_message: error_message }, status: 422
    end
  end

  def remove_media
    media = MediaResponse.find_by!(id: params[:media_id], users_result_id: @users_result.id)
    media.destroy
    if @users_result.answers&.dig(media.question_id.to_s)
      @users_result.answers[media.question_id.to_s]['answers'] = []
      @users_result.save
    end
    head :ok
  end

  def complete_multipart_upload
    media = @users_result.media_responses.find(params[:media_id])
    MediaResponses::CompleteMultipartUpload.call!(media, params[:asset_key], params[:upload_id], params[:parts])

    render json: MediaResponseSerializer.new.serialize(media.reload)
  end

  def mark_as_user_selected_take
    media = @users_result.media_responses.find(params[:media_id])
    MediaResponses::MarkAsUserSelected.call!(media)
    head :ok
  end

  def set_user_result
    @users_result = UsersResult.joins(:user_assessment).
                    where(user_assessments: { evaluator_id: current_user.id }).
                    find(params[:id])
    authorize [:end_user, @users_result]
    user_assessment = @users_result.user_assessment
    if request.format.html? && user_assessment.closed?
      redirect_to assessment_completed_path(user_assessment.campaign_id, user_assessment_id: user_assessment.id)
    end
  end

  private

  def user_assessment
    @user_assessment ||= @users_result.user_assessment
  end

  def resource_params
    params[:resource].permit(
      :current_element, :current_page, :status, :step, :progress, :completion_status_code, norm_data: {},
      prev_pages: [:element, :page, { questionIds: [] }], embedded_data: {}, answers: {}
    )
  end

  def meta_data_params
    params.permit(meta_data: {})
  end
end
