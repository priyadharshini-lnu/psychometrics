# frozen_string_literal: true

class AssignsController < ApplicationController
  include ::Threesixty::InitialState
  include AuthenticateAnonymousUser

  prepend_before_action :authenticate_anonymous_user!
  before_action :set_assign, only: %i[pass assessment update upload_media_url
                                      upload_callback remove_media update_meta_data
                                      complete_multipart_upload mark_as_user_selected_take]
  append_before_action :pundit_authorize

  # Skip CSRF
  skip_before_action :verify_authenticity_token, only: %i[update]
  initial_state_for :pass

  def pass
    @assign.in_progress!
    @available_translations = ::Translation.available_translation_for_assessment(@assign.assessment_id)
    if params[:lang] && (@available_translations + [I18n.default_locale.to_s]).include?(params[:lang])
      @assign.update(selected_locale: params[:lang])
    end
    @selected_locale = @assign.selected_locale || user_locale
    @translations = ::Translation.to_hash_for_assessment(@assign.assessment_id, @selected_locale)

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: ::AssignSerializer.new(context: {}).serialize(@assign)
      end
    end
  end

  def assessment
    @selected_locale = @assign.selected_locale || user_locale
    render json: AssessmentSerializer.new(
      context: {
        include: '**',
        selected_locale: @selected_locale,
        piped_text_context: build_piped_context
      }
    ).serialize(@assign.assessment)
  end

  def update
    assign_params = ::UsersResults::ExtendResourceParams.call!(resource_params.to_h, params[:question_ids], @assign)

    @form = AssignForm.from_params(assign_params)
    UpdateAssign.call(@form, @assign, current_user)

    render json: AssignUpdateSerializer.new(
      context: {
        current_block_id: params[:current_block_id], piped_text_context: build_piped_context
      }
    ).serialize(@assign)
  end

  def update_meta_data
    @assign.update!(meta_data_params)
    head :no_content
  end

  def accept_privacy
    @current_membership.privacy_consents.create!
    render json: { status: :ok }
  end

  def upload_media_url
    MediaResponses::GetUploadUrl.call(@assign, params[:question_id]) do
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
    media = MediaResponse.find_by!(id: params[:media_id], assign_id: @assign.id)
    media.destroy
    if @assign.results&.dig(media.question_id.to_s)
      @assign.results[media.question_id.to_s]['answers'] = []
      @assign.save
    end
    head :ok
  end

  def complete_multipart_upload
    media = @assign.media_responses.find(params[:media_id])
    MediaResponses::CompleteMultipartUpload.call!(media, params[:asset_key], params[:upload_id], params[:parts])

    render json: MediaResponseSerializer.new.serialize(media.reload)
  end

  def mark_as_user_selected_take
    media = @assign.media_responses.find(params[:media_id])
    MediaResponses::MarkAsUserSelected.call!(media)
    head :ok
  end

  private

  def set_assign
    @assign = policy_scope(Assign).where.not(status: %i[completed timed_out]).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to root_path
  end

  # Authorisation user
  def pundit_authorize
    authorize @assign || Assign
  end

  def multiple_reports(assigns_reports)
    assigns_reports.group_by(&:report_id).map do |report_id, group|
      Facades::Assigns::MultipleReport.new(report_id, group, pundit_user)
    end
  end

  def multiple_assigns_reports(user, project, report_ids)
    AssignsReport.includes(assign: %i[membership project_assign]).
      where(assigns: { memberships: { user_id: user.id, client_id: project.subtree_ids } }).
      where(report_id: report_ids)
  end

  def multiple_reports_ids(reports_ids)
    Report.multiple.where(id: reports_ids).ids
  end

  def current_campaign_user
    CampaignUser.find_by(user_id: @current_membership.user_id, campaign: params[:campaign_id])
  end

  def build_piped_context
    {
      evaluator: current_user,
      subject: current_user,
      threesixty_campaign: {},
      result: @assign
    }
  end

  def resource_params
    params[:resource].permit(
      :current_element, :current_page, :status, :step, norm_data: {}, embedded_data: {}, results: {},
      prev_pages: [:element, :page, { questionIds: [] }]
    )
  end

  def meta_data_params
    params.permit(meta_data: {})
  end
end
