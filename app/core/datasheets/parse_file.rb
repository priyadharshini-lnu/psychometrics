# frozen_string_literal: true

module Datasheets
  class ParseFile < Rectify::Command
    def initialize(form, project)
      @form = form
      @project = project
    end

    def call
      return broadcast :invalid if form.invalid?

      transaction do
        create_and_update_datasheet
        parse_file
      end
      broadcast :ok, datasheet
    end

    private

    attr_reader :form, :project, :datasheet

    def create_and_update_datasheet
      @datasheet = project.datasheet.nil? ? project.build_datasheet : project.datasheet
      datasheet.attributes = { columns: form.parsed_file.first }
      datasheet.save!
    end

    def parse_file
      form.parsed_file[1..-1].each do |data|
        email = ActionView::Base.full_sanitizer.sanitize(data[Datasheet::EMAIL_COLUMN])
        next if email.blank?

        row = datasheet.rows.find_or_initialize_by(email: email)
        row.data = data.except(Datasheet::EMAIL_COLUMN)
        row.save!
      end
    end
  end
end
