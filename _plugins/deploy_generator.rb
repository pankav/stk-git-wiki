require 'poparser'

module STKWebsite
    class DeployGenerator < Jekyll::Generator
        priority :highest
        def generate(site)
            supported_languages = []
            site.data['js_translations'] = {}
            site.data['po'] = {}
            site.data['po']['stk-website'] = PoParser.parse('')
            Dir.foreach('_translations') do |po_file|
            next if po_file == '.' or po_file == '..' or po_file == 'en.po' or po_file == 'stk-website.pot'
                lang = File.basename(po_file, '.po')
                po = PoParser.parse_file('_translations/' + po_file)
                if po.stats[:translated] == 0 then
                    next
                end
                site.data['po'][lang] = po
                supported_languages.push(lang)
            end
            page_translations = {}
            site.pages.reverse_each do |page|
                if page.path.start_with?('wiki/') and File.extname(page.name) == '.md' then
                    # Remove first 5 characters and extract string before /
                    lang = page.path[5..].split('/')[0]
                    basename = File.basename(page.name, '.md')
                    if supported_languages.include? lang then
                        page.data['lang'] = lang
                        page.data['permalink'] = '/' + lang + '/:basename'
                    elsif not lang.include? '.' then
                        # Remove page in language folder which doesn't have po file
                        site.pages.delete(page)
                        next
                    else
                        lang = 'en'
                        page.data['lang'] = lang
                    end
                    if lang != 'en' then
                        if page_translations.include?(basename) then
                            page_translations[basename].push(lang)
                        else
                            page_translations[basename] = [ lang ]
                        end
                    end
                else
                    page.data['layout'] = nil
                end
            end
            for page in site.pages do
                if File.extname(page.name) != '.md' then
                    next
                end
                basename = File.basename(page.name, '.md')
                lang = page.data['lang']
                if lang then
                    if basename == 'Main_Page' then
                        if lang == 'en' then
                            page.data["redirect_from"] = ['/', '/en', 'en/Main_Page']
                        else
                            page.data["redirect_from"] = [ '/' + lang]
                        end
                    elsif lang == 'en' then
                        page.data["redirect_from"] = [ '/en/' + basename]
                    end
                    if lang == 'en' then
                        missing = supported_languages.dup
                        if page_translations.include?(basename) then
                            for page_translation in page_translations[basename] do
                                missing.delete_if {|i| i == page_translation }
                            end
                        end
                        for missing_translation in missing do
                            page.data["redirect_from"].push(missing_translation + '/' + basename)
                        end
                    end
                end
            end
        end
    end
end
