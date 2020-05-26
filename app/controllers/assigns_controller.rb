# frozen_string_literal: true

# == Schema Information
#
# Table name: assigns
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  results       :jsonb
#  scoring       :jsonb
#  embedded_data :jsonb
#  status        :integer          default("not_started")
#  role          :integer          default("member")
#  completed_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  step          :integer
#  membership_id :integer
#  norm_data     :jsonb
#  agile_scoring :jsonb
#  started_at    :datetime
#

class AssignsController < ApplicationController
  include ::Threesixty::InitialState
  include AuthenticateAnonymousUser

  prepend_before_action :authenticate_anonymous_user!
  before_action :set_assign, only: %i[pass assessment update upload_media_url
                                      upload_callback remove_media update_meta_data]
  append_before_action :pundit_authorize

  # Skip CSRF
  skip_before_action :verify_authenticity_token, only: %i[update]
  initial_state_for :pass

  def pass
    @assign.in_progress!
    @threesixty_subject = @assign.threesixty? ? @assign.threesixty_subject : nil
    @available_translations = ::Translation.available_translation_for_assessment(@assign.assessment_id)
    if params[:lang] && (@available_translations + [I18n.default_locale.to_s]).include?(params[:lang])
      @assign.update(selected_locale: params[:lang])
    end
    @selected_locale = @assign.selected_locale || user_locale
    @translations = ::Translation.to_hash_for_assessment(@assign.assessment_id, @selected_locale)

    respond_to do |format|
      format.html { render 'threesixty/campaigns/show', layout: 'layouts/threesixty_campaign' }
      format.json do
        render json: @assign, serializer: AssignSerializer
      end
    end
  end

  def assessment
    piped_text_context = {
      evaluator: current_user,
      subject: current_user,
      threesixty_campaign: {}
    }

    render json: @assign.assessment,
           serializer: AssessmentSerializer,
           include: '**',
           piped_text_context: piped_text_context
  end

  def update
    assign_params = ::UsersResults::ExtendResourceParams.call!(resource_params.to_h, params[:question_ids], @assign)

    @form = AssignForm.from_params(assign_params)
    UpdateAssign.call(@form, @assign, current_user)

    render json: { expired: @assign.expired? }
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
    render json: MediaResponses::GetUploadUrl.call!(@assign, params[:question_id])
  end

  def upload_callback
    media = MediaResponse.find(params[:media_id])
    media.asset_key = params[:asset_key]
    if media.save
      render json: media.reload.as_json.merge(filename: media.filename)
    else
      error_message = media.errors.messages.values.join(',')
      media.destroy
      render json: { error_message: error_message }, status: :unprocessable_entity
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
    media = @assign.media_responses.find_by!(id: params[:media_id])
    MediaResponses::CompleteMultipartUpload.call!(media, params[:upload_id], params[:parts])

    render json: media.reload.as_json
  end

  private

  def set_assign
    @assign = policy_scope(Assign).where.not(status: :completed).find(params[:id])
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

  def current_campaigns_user
    CampaignsUser.find_by(user_id: @current_membership.user_id, campaign: params[:campaign_id])
  end

  def resource_params
    params[:resource].permit(
      :current_element, :current_page, :status, :step, norm_data: {}, embedded_data: {}, results: {}
    )
  end

  def meta_data_params
    params.permit(meta_data: {})
  end
end
