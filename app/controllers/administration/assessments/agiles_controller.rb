# frozen_string_literal: true

class Administration::Assessments::AgilesController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  prepend_before_action :set_resource_class
  before_action :set_resource
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize

  def show
    add_breadcrumb resource.decorate.display_name
  end

  def update
    form = Assessments::AgileForm.new(agile_params)
    if form.valid?
      resource.agile.update(form.attributes.except(:extra))
      resource.update(extra: form.extra) if form.extra
      audit! :update, resource, payload: agile_params
      head :ok
    else
      render json: { errors: form.errors.messages }, status: 400
    end
  end

  private

  def agile_params
    params.expect(
      agile: [config: {},
              translations: {},
              extra: {}]
    )
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[admin root]
    add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), "#{admin_path}/assessments"
  end

  def set_resource
    @_resource = policy_scope(resource_class).find(params[:assessment_id])
  end

  def set_resource_class
    @_resource_class ||= Assessment # rubocop:disable Naming/MemoizedInstanceVariableName
  end
end
