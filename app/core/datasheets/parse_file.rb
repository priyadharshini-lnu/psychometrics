module Datasheets
  class ParseFile < Rectify::Command
    def initialize(form, project)
      @form = form
      @project = project
    end

    def call
      return broadcast :invalid if form.invalid?
      transaction do
        form.id.blank? ? create_datasheet : update_datasheet
        parse_file
      end
      broadcast :ok, datasheet
    end

    private

    attr_reader :form, :project, :datasheet

    #
    #
    def create_datasheet
      @datasheet = project.datasheets.create(filename: form.file.original_filename,
                                             columns: form.parsed_file.first)
    end

    def update_datasheet
      @datasheet = project.datasheets.update(form.id, filename: form.file.original_filename,
                                                      columns: form.parsed_file.first)
    end

    def parse_file
      form.parsed_file[1..-1].each do |data|
        email = ActionView::Base.full_sanitizer.sanitize(data['Email Address'])
        row = datasheet.rows.find_or_initialize_by(email: email)
        row.data = data.except('Email Address')
        row.save!
      end
    end
  end
end
