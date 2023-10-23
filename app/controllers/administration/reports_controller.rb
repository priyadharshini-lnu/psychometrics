# frozen_string_literal: true

module Administration
  class ReportsController < Administration::BaseController
    include Archivable
    # Turn off normally auth
    skip_before_action :authenticate_user!
    # Turn on auth by token
    prepend_before_action :authenticate_user_from_token!

    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[show edit update destroy copy toggle_status sidebar preview
                                          upload_data_sheet toggle_archive soft_delete restore]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize, except: [:sidebar]
    render_entrypoint :index, element: 'reports', entry: 'admin/reports'

    def upload_data_sheet
      @form = ::Sheets::SheetForm.from_params(params).with_context(sheet_type: 'Datasheet')
      render json: @form.parsed_file.second.map { |k, v| { name: k, type: v } }
    end

    def preview
      add_breadcrumb resource.decorate.display_name, action: :show, id: resource
      respond_to do |format|
        format.html
      end
    end

    private

    def pundit_authorize
      authorize(
        resource || resource_class,
        nil,
        {
          project_id: resource&.owner_id
        }
      )
    end

    # Set model
    def set_resource_class
      @_resource_class ||= Report # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def authenticate_user_from_token!
      user_token = params[:user_token].presence
      user       = user_token && User.find_by(authentication_token: user_token.to_s)
      sign_in(user, store: false) if user
      authenticate_user!
    end
  end
end
