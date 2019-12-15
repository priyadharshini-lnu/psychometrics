# frozen_string_literal: true

namespace :threesixty do
  task :load_instruction_template, [:template_name] => :environment do |_, args|
    instruction_templates = YAML.safe_load(
      ERB.new(File.read("#{Rails.root}/config/threesixty/instruction_template.yml")).result
    )
    instruction_template = instruction_templates.find { |it| it['name'] == args[:template_name] }

    abort("Instruction template with name '#{args[:template_name]}' not present in yml") unless instruction_template

    Threesixty::Campaign.find_each do |threesixty_campaign|
      template = threesixty_campaign.instruction_templates.find_by(name: instruction_template['name'])
      threesixty_campaign.instruction_templates.create!(instruction_template) unless template
    end
  end
end
