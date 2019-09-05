module Archivable
  extend ActiveSupport::Concern

  def toggle_archive
    @_resource.toggle!(:archived)
    respond_to do |format|
      format.html do
        redirect_back(
            fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
        )
      end
      format.js
    end
  end
end