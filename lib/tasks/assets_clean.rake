# frozen_string_literal: true

Rake::Task['assets:clean'].enhance do
  if ENV.fetch('CLEAN_NODE_MODULES', '') == 'enabled'
    Rails.logger.info 'Deleting node_modules'
    FileUtils.remove_dir('node_modules', true)
  end
end
