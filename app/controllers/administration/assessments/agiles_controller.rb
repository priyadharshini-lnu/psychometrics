# frozen_string_literal: true

class Administration::Assessments::AgilesController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  prepend_before_action :set_resource_class
  before_action :set_resource
  append_before_action :pundit_authorize

  def show
    render json: {
      assessmentId: resource.id,
      config: resource.agile_config,
      translations: resource.agile_translations,
      extra: resource.extra
    }
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

  def set_resource
    @_resource = policy_scope(resource_class).find(params[:assessment_id])
  end

  def set_resource_class
    @_resource_class ||= Assessment # rubocop:disable Naming/MemoizedInstanceVariableName
  end
end
