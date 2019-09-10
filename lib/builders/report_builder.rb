# frozen_string_literal: true

module Builders
  module PermitNested
    refine ActionController::Parameters do
      def permit!
        each_pair do |_key, value|
          Array.wrap(value).flatten.each do |v|
            v.permit! if v.respond_to? :permit!
          end
        end

        @permitted = true
        self
      end
    end
  end

  class ReportBuilder
    using PermitNested
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
        @report.update(@report_params.slice(:name, :props, :data_sheet_columns))
        @report_params[:pages].each do |page_params|
          id = page_params.delete(:id)
          modules = page_params.delete(:modules)
          page = @report.pages.find_or_initialize_by(id: id)

          page.destroy && next if page_params.delete(:removed)
          page.update(page_params)

          modules.each do |module_params|
            mod = page.modules.find_or_initialize_by(id: module_params.delete(:id))
            mod.destroy && next if module_params.delete(:removed)
            mod.update(module_params)
          end
        end
      rescue StandardError => e
        Rails.logger.info(e)
        return false
      end
      true
    end
  end
end
