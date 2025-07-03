# frozen_string_literal: true

module Administration
  class ImportSkills < BaseCommand
    def initialize(file, project_id)
      @file = file
      @project_id = project_id
    end

    def call
      begin
        csv_data = CsvFileParser.call!(@file)
      rescue Errors::DownloadFailedError => e
        raise Errors::ImportError, e.message
      end

      ActiveRecord::Base.transaction do
        process_csv_data(csv_data)
      end
      true
    end

    private

    def process_csv_data(csv_data)
      headers = csv_data.shift

      csv_data.each.with_index(2) do |row, line_number|
        row_data = headers.zip(row).to_h
        process_row(row_data, line_number)
      end
    end

    def process_row(row, line_number)
      skill = initialize_skill(row)
      assign_skill_attributes(skill, row)

      skill.save!
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError, I18n.t(
        'administration.skills.errors.import.save_failed',
        line_number: line_number,
        name: row['Name'],
        message: e.message
      )
    end

    def initialize_skill(row)
      if row['ID'].present?
        Skill.find_by(id: row['ID'], project_id: @project_id) || Skill.new
      else
        Skill.new
      end
    end

    def assign_skill_attributes(skill, row)
      attributes = {
        name: row['Name'],
        description: row['Description'],
        skill_type: normalize_skill_type(row['SkillType'])
      }
      attributes[:project_id] = @project_id if @project_id.present?

      skill.assign_attributes(attributes)
      assign_tags(skill, row)
      assign_skill_group(skill, row)
    end

    def assign_tags(skill, row)
      return if row['Tag'].blank?

      skill.tag_list = row['Tag'].split(',').map(&:strip)
    end

    def assign_skill_group(skill, row)
      return if row['SkillGroup'].blank?

      name = row['SkillGroup'].strip
      skill_group = SkillGroup.find_by(name: name, project_id: @project_id)
      skill.skill_group = skill_group if skill_group.present?
    end

    def normalize_skill_type(skill_type)
      skill_type = skill_type.to_s.strip.downcase
      %w[behavioral technical other].include?(skill_type) ? skill_type : 'other'
    end
  end
end
