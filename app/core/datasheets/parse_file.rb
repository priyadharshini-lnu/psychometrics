# frozen_string_literal: true

module Datasheets
  class ParseFile < Rectify::Command
    private_attr_reader :form, :parent_resource, :datasheet

    def initialize(form, parent_resource)
      @form = form
      @parent_resource = parent_resource
    end

    def call
      transaction do
        create_and_update_datasheet
        parse_file
      end

      broadcast :ok, datasheet
    end

    private

    def create_column(name, type)
      if name == Datasheet::EMAIL_COLUMN
        { name: name.chomp, type: type, accessor_access: true, dashboard_use: true, visible_in_list: true }
      else
        { name: name.chomp, type: type, accessor_access: false, dashboard_use: false, visible_in_list: false }
      end
    end

    def create_and_update_datasheet
      @datasheet = if parent_resource.is_a?(Campaign)
                     parent_resource.campaign_datasheet || parent_resource.build_campaign_datasheet
                   else
                     parent_resource.datasheet || parent_resource.build_datasheet
                   end

      columns_in_file = form.parsed_file.second

      columns_to_add = []
      columns = datasheet.columns || []
      columns_in_file.each do |name, type|
        columns_to_add << create_column(name, type) unless columns.find { |c| c['name'] == name }
      end

      datasheet.update!(columns: columns + columns_to_add)
    end

    def parse_file
      form.data_rows.each do |data|
        email = ActionView::Base.full_sanitizer.sanitize(data[Datasheet::EMAIL_COLUMN].strip)
        next if email.blank?

        row = datasheet.rows.find_or_initialize_by(email: email)
        data = data.reject { |k, _v| k == Datasheet::EMAIL_COLUMN }
        row.data = (row.data || {}).merge(data)
        row.save!
      end
    end
  end
end
