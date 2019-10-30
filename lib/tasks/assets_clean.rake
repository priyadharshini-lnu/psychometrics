# frozen_string_literal: true

Rake::Task['assets:clean'].enhance do
  if ENV.fetch('CLEAN_NODE_MODULES', '') == 'enabled'
    Rails.logger.info 'Deleting node_modules'
    exclude_folders = ['puppeteer']
    Dir['node_modules/**'].each do |f|
      if exclude_folders.include?(f.gsub('node_modules/', ''))
        system("cd #{f} && yarn install")
      else
        FileUtils.remove_dir(f, true)
      end
    end
  end
end
