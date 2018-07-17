namespace :aliases do
  desc 'Change fieldname in Reports::Module props.'
  task change_fieldname_in_reports_module_props: :environment do
    modules = Reports::Module.where("props ->> 'fieldName' = 'name' AND props ->> 'basedOn' = 'factor'")
    ActiveRecord::Base.transaction do
      modules.find_each do |m|
        m.props['fieldName'] = 'alias'
        m.save!
      end
      puts "Updated #{modules.count} modules."
    end
  end
end
