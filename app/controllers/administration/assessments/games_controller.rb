# frozen_string_literal: true

class Administration::Assessments::GamesController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize

  def show
    add_breadcrumb resource.decorate.display_name
  end

  def update
    form = Assessments::GameForm.from_params(params[:game])
    if form.valid?
      resource.game.update(form.attributes)
      head :ok
    else
      render json: { errors: form.errors.messages }, status: :bad_request
    end
  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
    add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), administration_assessments_path
  end

  def set_resource
    @_resource = policy_scope(resource_class).find(params[:assessment_id])
  end

  def set_resource_class
    @_resource_class ||= Assessment # rubocop:disable Naming/MemoizedInstanceVariableName
  end
end
