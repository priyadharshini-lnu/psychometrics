namespace :aliases do
  desc 'Remove name and label from Reports::Module'
  task remove_value_and_label_from_props: :environment do
    modules = Reports::Module.where("props -> 'source' -> 'factors' IS NOT NULL")
    ActiveRecord::Base.transaction do
      modules.find_each do |m|
        m.props['source']['factors'].each do |factor|
          factor.delete('label')
          factor.delete('value')
        end
        m.save!
      end
      puts "Updated #{modules.count} modules."
    end
  end
end
