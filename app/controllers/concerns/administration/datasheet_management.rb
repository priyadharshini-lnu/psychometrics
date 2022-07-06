# frozen_string_literal: true

module Administration
  module DatasheetManagement
    extend ActiveSupport::Concern

    included do
      prepend_before_action :set_resource_class
      before_action :pundit_authorize
    end

    def add_column
      form = Datasheets::DatasheetColumnForm.from_params(params[:column]).with_context(datasheet: datasheet)
      if form.valid?
        datasheet.update!(columns: datasheet.columns + [form.attributes])
        render json: datasheet.columns
      else
        render json: { errors: form.errors }, status: 422
      end
    end

    def update_column
      form = Datasheets::DatasheetColumnForm.from_params(params[:column])
      if form.valid?
        datasheet.update!(columns: datasheet.columns.map do |col|
          col['name'] == params[:column][:name] ? form.attributes : col
        end)
        render json: datasheet.columns
      else
        render json: { errors: form.errors }, status: 422
      end
    end

    def update_columns_order
      form = Datasheets::DatasheetColumnsForm.from_params(params)
      if form.valid?
        datasheet.update!(columns: form.attributes[:columns].map(&:attributes))
        render json: datasheet.columns
      else
        render json: { errors: form.errors }, status: 422
      end
    end

    def remove_columns
      render json: Datasheets::RemoveColumns.call!(datasheet, params[:columns])
    end

    private

    def audit_resources
      {
        campaign: parent_resource.is_a?(Campaign) ? parent_resource : nil,
        project: parent_resource.is_a?(Client) ? parent_resource : nil
      }
    end

    def pundit_authorize
      authorize(resource || resource_class, nil, project_id: project.id, campaign_id: campaign&.id)
    end

    def set_resource_class
      @_resource_class ||= Datasheet # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
