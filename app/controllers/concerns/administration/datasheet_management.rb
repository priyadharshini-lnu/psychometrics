# frozen_string_literal: true

module Administration
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
          return render json: { list: [], total: 0, columns: [] } if datasheet.nil?

          datasheet_rows = datasheet.rows.ransack(params[:filters]).result
          paginated_datasheet_rows = datasheet_rows.page(params[:page])
          serialized_datasheet_rows = paginated_datasheet_rows.map do |row|
            DatasheetRows::GetData.call!(row, datasheet: datasheet, without_types: Datasheet::ADVANCE_TYPES)
          end

          render json: {
            list: serialized_datasheet_rows,
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
        render json: DatasheetRows::GetData.call!(datasheet_row)
      else
        render json: { errors: form.errors.full_messages }, status: 422
      end
    end

    def update
      resource.update!(data: params.permit(*datasheet.column_names))

      render json: DatasheetRows::GetData.call!(resource)
    end

    def bulk_delete
      datasheet.rows.where(id: params[:ids]).map(&:destroy!)

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

    private

    def set_resource_class
      @_resource_class ||= DatasheetRow # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
