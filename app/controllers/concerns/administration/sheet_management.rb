# frozen_string_literal: true

module Administration
  module SheetManagement
    extend ActiveSupport::Concern

    included do
      prepend_before_action :set_resource_class
      before_action :pundit_authorize
    end

    def get_columns
      render json: sheet&.columns || []
    end

    def add_column
      form = form_class.from_params(params[:column]).with_context(sheet: sheet, form_type: :add)
      if form.valid?
        sheet.update!(columns: sheet.columns + [form.attributes])
        render json: sheet.columns
      else
        render json: { errors: form.errors }, status: 422
      end
    end

    def update_column
      form = form_class.from_params(params[:column]).with_context(sheet: sheet)
      if form.valid?
        sheet.update!(columns: sheet.columns.map do |col|
          col['name'] == params[:column][:name] ? form.attributes : col
        end)
        render json: sheet.columns
      else
        render json: { errors: form.errors }, status: 422
      end
    end

    def update_columns_order
      forms = params[:columns].map { |column| form_class.from_params(column).with_context(sheet: sheet) }
      if forms.all?(&:valid?)
        sheet.update!(columns: forms.map(&:attributes))
        render json: sheet.columns
      else
        render json: { errors: forms.map(&:errors).flatten }, status: 422
      end
    end

    def remove_columns
      render json: Sheets::RemoveColumns.call!(sheet, params[:columns])
    end

    private

    def form_class
      sheet.type == 'Accesssheet' ? Sheets::AccesssheetColumnForm : Sheets::DatasheetColumnForm
    end

    def audit_resources
      {
        campaign: parent_resource.is_a?(Campaign) ? parent_resource : nil,
        project: parent_resource.is_a?(Client) ? parent_resource : nil
      }
    end

    def policy_class
      return ::Administration::Campaigns::AccesssheetPolicy if params[:type] == 'Accesssheet'

      ::Administration::SheetPolicy
    end

    def pundit_authorize
      authorize(
        resource || resource_class,
        nil,
        project_id: project.id,
        campaign_id: campaign&.id,
        policy_class: policy_class
      )
    end

    def set_resource_class
      @_resource_class ||= Sheet # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
