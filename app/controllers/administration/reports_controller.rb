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
                                          upload_data_sheet toggle_archive soft_delete restore remap_assessment]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize, except: [:sidebar]
    render_entrypoint :index, element: 'reports', entry: 'admin/reports'

    def upload_data_sheet
      @form = ::Sheets::SheetForm.from_params(params).with_context(sheet_type: 'Datasheet')
      render json: @form.parsed_file.second.map { |k, v| { name: k, type: v } }
    end

    def remap_assessment
      AdminJob.call(:remap_report_assessment,
                    { report_id: resource.id,
                      current_assessment_id: params[:current_assessment_id],
                      new_assessment_id: params[:new_assessment_id] }, current_user)

      render json: { success: true }
    end

    def show
      render layout: 'report'
    end

    def preview
      add_breadcrumb resource.decorate.display_name, action: :show, id: resource
      respond_to(&:html)
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
