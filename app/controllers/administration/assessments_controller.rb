# frozen_string_literal: true

class Administration::AssessmentsController < Administration::BaseController
  include Archivable
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[show edit update destroy toggle_status sidebar copy
                                        preview export toggle_archive questions factors soft_delete restore]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :pundit_authorize, except: [:sidebar]
  # we need this line to override a behviour from BaseController
  append_after_action :verify_policy_scoped, only: []

  render_entrypoint :index, element: 'assessments', entry: 'admin/assessments'

  def index; end

  def update
    resource.updated_by = current_user

    resource.attributes = resource_params.slice(:resources)
    respond_to do |format|
      if resource.save
        audit! :update, resource, payload: params
        format.json { render json: :ok }
      else
        format.json { render json: :fail }
      end
    end
  end

  def preview
    @translations = ::Translation.to_hash_for_assessment(resource.id, user_locale)
    @available_translations = ::Translation.available_translation_for_assessment(resource.id)
    render layout: 'empty'
  end

  def reports
    render layout: 'empty'
  end

  def assessments
    render json: Assessment.where(archived: false).pluck(:id, :name).map { |id, name| { id: id, name: name } }
  end

  def questions
    render json: resource.questions.where(type: 'StaticContent').pluck(:id, :name, :props).map { |id, name, props|
      { id: id, name: name, props: props }
    }
  end

  def show
    add_breadcrumb resource.decorate.display_name
  end

  def factors
    render json: resource.dimension.all_factors.as_json(only: %i[id name])
  end

  def upload_data_sheet
    @form = ::Sheets::SheetForm.from_params(params).with_context(sheet_type: 'Datasheet')
    render json: @form.parsed_file.second.map { |k, v| { name: k, type: v } }
  end

  private

  def pundit_authorize
    authorize(
      resource || resource_class,
      nil,
      project_id: resource&.owner_id
    )
  end

  # Set model
  def set_resource_class
    @_resource_class ||= Assessment # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def resource_params
    params.require(:resource).permit(
      :type, :mindmill_id, :name, :category, :description, :dimension_id, :timing,
      :status, :icon, :icon_color, :remove_icon, :poster, :remove_poster,
      :enable_video_check, :enable_audio_check, :enable_network_check,
      :owner_id, :project_id,
      external_settings: %i[assessment_id norm_id schedule_config],
      resources: %i[assessmentId questionId], options: {}
    )
  end
end
