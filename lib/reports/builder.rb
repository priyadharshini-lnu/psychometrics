module Reports
  class Builder
    # Authorisation flow
    include Pundit
    include Administration::Policies
    ## Custom current user helper for Pundit
    def pundit_user
      current_user
    end

    attr_accessor :current_user, :report, :report_params

    def initialize(report, params, current_user)
      @current_user = current_user
      @report = report
      @report_params = params.require(:report).permit!
    end

    def save
      ActiveRecord::Base.transaction do
        begin
          @report.update(@report_params.slice(:name, :props))
          @report_params[:pages].each do |page_params|
            id = page_params.delete(:id)
            modules = page_params.delete(:modules)
            page = @report.pages.find_or_initialize_by(id: id)

            page.destoy && next if page_params.delete(:removed)
            page.update(page_params)

            modules.each do |module_params|
              mod = page.modules.find_or_initialize_by(id: module_params.delete(:id))
              mod.destoy && next if module_params.delete(:removed)
              mod.update(module_params)
            end
          end
        rescue => e
          Rails.logger.info(e)
          return false
        end
      end
      true
    end
  end
end
