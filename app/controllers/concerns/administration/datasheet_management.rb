# frozen_string_literal: true

module Administration
  # rubocop:disable Metrics/ModuleLength
  module DatasheetManagement
    extend ActiveSupport::Concern

    included do
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update]
    end

    def index
      respond_to do |format|
        format.html
        format.json do
          if datasheet.nil?
            return render json: {
              list: [], total: 0, permissions: permissions, columns: [
                { id: Datasheet::EMAIL_COLUMN, type: 'String', visible: true }
              ]
            }
          end

          datasheet_rows = datasheet.rows.ransack(params[:filters]).result
          paginated_datasheet_rows = datasheet_rows.page(params[:page])
          serialized_datasheet_rows = paginated_datasheet_rows.map do |row|
            DatasheetRows::GetData.call!(row, datasheet: datasheet, without_types: Datasheet::ADVANCE_TYPES)
          end

          render json: {
            list: serialized_datasheet_rows,
            permissions: permissions,
            total: datasheet_rows.count,
            columns: Datasheets::GetColumnDefinition.call!(datasheet)
          }
        end
      end
    end

    def show
      resource_datasheet = resource.datasheet
      response = [Administration::DetailsDatasheetRowSerializer.new(resource).to_h]
      return render json: response unless resource.datasheet.campaign_id?

      project_row = resource_datasheet.campaign.project.datasheet&.rows&.find_by(email: resource.email)
      response << Administration::DetailsDatasheetRowSerializer.new(project_row).to_h if project_row

      render json: response
    end

    def create
      form = DatasheetRows::Form.from_params(email: params['Email'],
        data: params.permit!.slice(*datasheet.column_names))
      if form.valid?
        datasheet_row = datasheet.rows.create(form.attributes)
        audit! :create, datasheet_row, **audit_resources, payload: form.attributes
        render json: DatasheetRows::GetData.call!(datasheet_row)
      else
        render json: { errors: form.errors.full_messages }, status: 422
      end
    end

    def update
      resource.update!(data: params.permit(*datasheet.column_names))
      audit! :update, resource, **audit_resources, payload: params.permit!

      render json: DatasheetRows::GetData.call!(resource)
    end

    def bulk_delete
      rows = datasheet.rows.where(id: params[:ids])
      audit! :bulk_delete, datasheet, **audit_resources, payload: { resources: rows.map(&:log_attribute_for_delete) }
      rows.map(&:destroy!)
      head :ok
    end

    def save_column_preference
      parent_resource = datasheet.parent_resource
      if parent_resource.datasheet_column_preference
        parent_resource.datasheet_column_preference.update(visible_columns: params[:visible_columns])
      else
        parent_resource.create_datasheet_column_preference(visible_columns: params[:visible_columns])
      end
      head :ok
    end

    def import
      form = ::Datasheets::DatasheetForm.from_params(params)
      if form.valid?
        AdminJob.call(:import_datasheet, {
          parent_resource_id: parent_resource.id,
          parent_resource_class: parent_resource.class.name,
          operation: params[:operation]
        }, current_user, params[:file])
        audit! :import, nil, **audit_resources, payload: params.permit!
      else
        render json: { errors: form.errors.messages.values.flatten }, status: 422
      end
    end

    def export
      results = ::Datasheets::Export.call!(parent_resource.datasheet)
      audit! :export, nil, **audit_resources
      respond_to do |format|
        format.xlsx { send_data results.to_stream.read, filename: "datasheet-for-#{parent_resource.name}.xlsx" }
      end
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

    def permissions
      GetPermissionsHash.call!(
        Administration::DatasheetRowPolicy,
        current_user, nil,
        ['export', 'import', 'update', 'edit', %w[add create], %w[delete destroy], %w[view show]],
        { project_id: project.id, campaign_id: campaign&.id }
      )
    end

    def set_resource_class
      @_resource_class ||= DatasheetRow # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
  # rubocop:enable Metrics/ModuleLength
end
