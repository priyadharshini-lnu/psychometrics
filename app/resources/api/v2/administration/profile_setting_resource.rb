# frozen_string_literal: true

class Api::V2::Administration::ProfileSettingResource < Api::V2::Administration::BaseResource
  attributes :update_in, :profile_fields, :required_default_fields, :locked_default_fields, :enabled_default_fields

  has_one :project

  ransack_filters %i[project_id_eq]

  audit_log_for :update, payload: '*'

  def update_in
    @model.update_in&.to_s
  end

  def profile_fields
    Panko::ArraySerializer.new(
      @model.profile_fields,
      each_serializer: ProfileFieldSerializer,
      context: {
        selected_locale: I18n.locale
      }
    ).to_a
  end

  def profile_fields=(new_fields)
    new_fields.each do |new_field|
      field = @model.profile_fields.find_by(question_id: new_field[:question_id])
      next field.destroy if new_field[:_remove]

      params = new_field.permit(%i[question_id required half_size position locked])
      if field
        field.update!(params)
      else
        @model.profile_fields.create(params)
      end
    end
  end
end
