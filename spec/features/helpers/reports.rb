# frozen_string_literal: true

module Features
  module Helpers
    module Reports
      def create_report(opts = {})
        visit '/administration/reports'
        click_link(t('administration.reports.index.add'), href: '/administration/reports/new')
        find('.modal-header').click
        fill_in 'resource_name', with: opts[:name]
        select opts[:assessment_name], from: 'resource_assessment_ids', visible: false
        click_on 'Create'
      end

      def enable_report(report)
        visit '/administration/reports'
        find("#report_#{report.id} .toggle-status").click
        find(:button, text: 'Yes').click
        wait_for_ajax
      end

      def disable_report(report)
        visit '/administration/reports'
        find("#report_#{report.id} .toggle-status").click
        find(:button, text: 'Yes').click
        wait_for_ajax
      end

      def copy_report(report)
        visit '/administration/reports'
        find("#report_#{report.id} .copy").click
      end

      def click_report(report)
        first("#report_#{report.id} td", text: report.decorate.created_at).click
      end
    end
  end
end
