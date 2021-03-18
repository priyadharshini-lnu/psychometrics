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

    def create_and_update_datasheet
      @datasheet = if parent_resource.is_a?(Campaign)
                     parent_resource.campaign_datasheet || parent_resource.build_campaign_datasheet
                   else
                     parent_resource.datasheet || parent_resource.build_datasheet
                   end
      columns_in_file = form.parsed_file.second
      columns = form.replace_existing? ? columns_in_file : (datasheet.columns || {}).merge(columns_in_file)
      datasheet.update!(columns: columns)
    end

    def parse_file
      form.parsed_file[2..-1].each do |data|
        email = ActionView::Base.full_sanitizer.sanitize(data[Datasheet::EMAIL_COLUMN].strip)
        next if email.blank?

        row = datasheet.rows.find_or_initialize_by(email: email)
        data = data.except(Datasheet::EMAIL_COLUMN)
        row.data = form.replace_existing? ? data : (row.data || {}).merge(data)
        row.save!
      end
    end
  end
end
