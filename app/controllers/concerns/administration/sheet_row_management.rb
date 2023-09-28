# frozen_string_literal: true

module Administration
  module SheetRowManagement
    extend ActiveSupport::Concern

    included do
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show update]
    end

    def index
      respond_to do |format|
        format.json do
          if sheet.nil?
            return render json: {
              list: [], total: 0, permissions: permissions, columns: []
            }
          end

          sheet_rows = sheet.rows.ransack(params[:filters]).result
          paginated_sheet_rows = sheet_rows.order(:id).page(params[:page])
          serialized_sheet_rows = paginated_sheet_rows.map do |row|
            SheetRows::GetData.call!(row, sheet: sheet, without_types: Sheet::ADVANCE_TYPES)
          end

          render json: {
            list: serialized_sheet_rows,
            permissions: permissions,
            total: sheet_rows.count,
            columns: sheet.columns
          }
        end
      end
    end

    def show
      resource_datasheet = resource.sheet
      response = [Administration::DetailsDatasheetRowSerializer.new(resource).to_h]
      return render json: response unless resource.sheet.campaign_id?

      project_row = resource_datasheet.campaign.project.sheets.first&.rows&.find_by(email: resource.email)
      response << Administration::DetailsDatasheetRowSerializer.new(project_row).to_h if project_row

      render json: response
    end

    def create
      form = SheetRows::Form.from_params(
        email: params['Email'],
        data: params.permit!.slice(*sheet.column_names)
      ).with_context(sheet: sheet)
      if form.valid?
        datasheet_row = sheet.rows.create(form.attributes)
        audit! :create, datasheet_row, **audit_resources, payload: form.attributes
        render json: SheetRows::GetData.call!(datasheet_row)
      else
        render json: { errors: form.errors.messages }, status: 422
      end
    end

    def update
      resource.update!(data: params.permit(*sheet.column_names))
      audit! :update, resource, **audit_resources, payload: params

      render json: SheetRows::GetData.call!(resource)
    end

    def bulk_delete
      rows = sheet.rows.where(id: params[:ids])
      audit! :bulk_delete, sheet, **audit_resources, payload: { resources: rows.map(&:log_attribute_for_delete) }
      rows.map(&:destroy!)
      head :ok
    end

    def import
      current_sheet = parent_resource.sheets.find_by(type: params[:type])
      form = ::Sheets::SheetForm.from_params(params).with_context(sheet_type: params[:type], sheet: current_sheet)
      if form.valid?
        if params[:type] == 'Accesssheet'
          AdminJob.call(:import_accesssheet, { campaign_id: parent_resource.id }, current_user, params[:file])
        else
          AdminJob.call(:import_datasheet, {
            parent_resource_id: parent_resource.id,
            parent_resource_class: parent_resource.class.name
          }, current_user, params[:file])
        end
        audit! :import, parent_resource.sheets.find_by(type: params[:type]), **audit_resources, payload: params
      else
        render json: { errors: form.errors.messages.values.flatten }, status: 422
      end
    end

    def export
      sheet = parent_resource.sheets.find_by(type: params[:type])
      results = ::Sheets::Export.call!(sheet)
      audit! :export, sheet, **audit_resources
      respond_to do |format|
        format.xlsx { send_data results.to_stream.read, filename: "sheet-for-#{parent_resource.name}.xlsx" }
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
      authorize(
        resource || resource_class,
        nil,
        project_id: project.id,
        campaign_id: campaign&.id,
        policy_class: policy_class
      )
    end

    def policy_class
      return ::Administration::Campaigns::AccesssheetRowPolicy if params[:type] == 'Accesssheet'

      ::Administration::SheetRowPolicy
    end

    def permissions
      GetPermissionsHash.call!(
        policy_class,
        current_user, nil,
        ['export', 'import', 'update', 'edit', %w[add create], %w[delete destroy], %w[view show]],
        { project_id: project.id, campaign_id: campaign&.id }
      )
    end

    def set_resource_class
      @_resource_class ||= SheetRow # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
